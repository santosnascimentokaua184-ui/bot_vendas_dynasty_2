const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandType, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js")
const { JsonDatabase, } = require("wio.db");
const Discord = require("discord.js")
const dbc = new JsonDatabase({ databasePath:"./data__botconfig.json" });
const dbcar = new JsonDatabase({ databasePath:"./data__carrinho.json" });
const dbe = new JsonDatabase({ databasePath:"./data__emojis.json" });
const dbep = new JsonDatabase({ databasePath:"./data__emojisGlob.json" });
const dbp = new JsonDatabase({ databasePath:"./data__perms.json" });
const { MercadoPagoConfig, Payment, PaymentRefund} = require("mercadopago")
const axios = require("axios")
const moment = require("moment")
const { sendMessagePixGerado, sendMessagePixCancelado, formatValor, sendMessagePixExpirado, sendMessagePixSucesso, sendMessagePixBlocked } = require("./fn__GerarPix.js")
module.exports = {
    name: "gerar",
    description: "🤖 | Gere uma cobrança",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "pix",
            description: "🤖 | Gere uma cobrança",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {                        
                    name: "valor",
                    description: "Valor da cobrança",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ],
   
    run: async(client, interaction) => {
        if (interaction.options.getSubcommand() === "pix") {
            const clientt = new MercadoPagoConfig({ accessToken: `${dbc.get(`pagamentos.acess_token`)}` });
            const payment = new Payment(clientt);
            const refund = new PaymentRefund(clientt);
            if (dbc.get(`pagamentos.sistema`) === "OFF") return interaction.reply({ content: `${dbe.get("13")} | Sistema de vendas automáticas **OFF**. Para gerar um pix ative o sistema de vendas.`, flags: 64});
            const palmito = interaction.client.channels.cache.get(dbc.get(`canais.vendas_privado`))
            if (!palmito) return interaction.reply({flags: 64, content: `${dbe.get("13")} | Canal logs inválido! Não é possível gerar pagamento com um canal de logs inválido.\n- Dê o comando **/painel bot**, vá em **Gerenciar Financeiro**, selecione a opção **Vendas Privadas** e defina um canal.`});
            if (interaction.user.id !== dbp.get(`${interaction.user.id}`)) {
                interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Você não tem permissão para usar este comando!`})
                return;
            }
            if (!clientt) return interaction.reply({ content: `${dbe.get("13")} | Acess Token inválido!`, flags: 64})
            let status = 1
            const valor = interaction.options.getString("valor")
            if (isNaN(valor) || valor.includes(',')) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Valor inválido! Coloque números ou siga o exemplo de como colocar: 3.27`});

            await sendMessagePixGerado(interaction, valor)
            const min = moment().add(20, 'minutes');
            const time = Math.floor(min.valueOf() / 1000);
            const embed = new EmbedBuilder()
            .setAuthor({ name: `Solicitação de pagamento.`, iconURL: interaction.user.displayAvatarURL()})
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(`- O usuário ${interaction.user} gerou um pix, e está fazendo uma solicitação de pagamento. Deseja pagar?`)
            .setFields(
                { name: `Valor:`, value: `R$${await formatValor(valor)}`, inline:true },
                { name: `Expira em:`, value: `<t:${time}:f> (<t:${time}:R>)`, inline:true }
            )
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setStyle(1)
                .setCustomId("pagar")
                .setLabel("Realizar Pagamento")
                .setEmoji(dbep.get("9")),
                new ButtonBuilder()
                .setStyle(2)
                .setCustomId("cancelar_solicita")
                .setLabel("Cancelar")
                .setEmoji(dbep.get("37"))
            )
            await interaction.reply({ embeds: [embed], components: [row]}).then((msg) => {
                setTimeout(() => {
                    if (status === 1) {
                        sendMessagePixExpirado(interaction, valor)
                        msg.delete()
                        interaction.channel.send({ content: `${dbe.get("13")} | Pagamento expirado!`})
                    }
                }, 1000 * 60 * 20);
                const interação = interaction.channel.createMessageComponentCollector({
                    componentType: Discord.ComponentType.Button,
                })
                interação.on("collect", async (interaction) => {
                    if (interaction.customId === 'cancelar_solicita') {
                        sendMessagePixCancelado(interaction, valor)
                        msg.delete()
                        interaction.channel.send({ embeds: [], components: [], content: `${dbe.get("13")} | Pix cancelado!`}).then(msg => {
                            setTimeout(() => {
                                msg.delete()
                            }, 1000 * 30);
                        })
                    }
                    if (interaction.customId === "pagar") {
                        const msg = await interaction.update({ flags: 64, embeds: [], components: [], content: `${dbe.get("16")} | Aguarde, gerando pagamento.`})
                        var payment_data = {
                            transaction_amount: Number(valor),
                            description: `Cobrança Gerada - ${interaction.user.username}`,
                            payment_method_id: 'pix',
                            payer: {
                            email: `${dbc.get(`email`) || "asaphs595@gmail.com"}`,
                            first_name: 'Paula',
                            last_name: 'Guimaraes',
                            identification: {
                                type: 'CPF',
                                number: '07944777984'
                            },
                            address: {
                                zip_code: '06233200',
                                street_name: 'Av. das NaÃƒÂ§oes Unidas',
                                street_number: '3003',
                                neighborhood: 'Bonfim',
                                city: 'Osasco',
                                federal_unit: 'SP'
                            }
                            },
                            notification_url: interaction.user.displayAvatarURL(),
                        }

                        payment.create({ body: payment_data })
                        .then(async function(data) {
                            const checkPaymentStatus = setInterval(() => {
                                axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                                    headers: {
                                        'Authorization': `Bearer ${dbc.get(`pagamentos.acess_token`)}`
                                    }
                                }).then(async (doc) => {
                                    const paymentGet = await payment.get({ id: data.id });
                                    const paymentStatus = paymentGet.status;
                                    
                                    if (paymentStatus === "approved") {
                                        const longName = String(doc.data.point_of_interaction.transaction_data.bank_info.payer.long_name || "N/A");

                                        const blockedBanks = (await dbc.get("pagamentos.blockbank")) || [];
                                        
                                        if (!Array.isArray(blockedBanks)) {
                                            console.error("blockedBanks não é um array:", blockedBanks);
                                        }
                                        
                                        const containsTerm = blockedBanks.some(term => {
                                            if (typeof term !== "string") {
                                                console.error("Elemento não é string:", term);
                                                return false;
                                            }
                                            return longName.toLowerCase().includes(term.toLowerCase());
                                        });
                                        clearInterval(checkPaymentStatus)
                                        if(containsTerm) {
                                            console.log("Banco bloqueado encontrado:", longName);
                                            await refund.create({
                                                payment_id: doc.data.id,
                                                body: {}
                                            })
                    
                                            const embedd = new EmbedBuilder()
                                            .setAuthor({ name: `❌ Erro na compra!`, iconURL: interaction.guild.iconURL({})})
                                            .setColor("Red")
                                            .setDescription(`Olá ${interaction.user}.\n- Notificamos que você está utilizando o banco **${longName}**.\n> Infelizmente, este banco está bloqueado em nossos registros pelos administradores do servidor.\n> Não se preocupe! Seu dinheiro já foi reembolsado. Se desejar adquirir o produto, por favor, utilize outro banco para realizar a compra.`)
                                            .setThumbnail(interaction.user.displayAvatarURL({}))
                                            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({})})
                                            .setTimestamp()
                                            sendMessagePixBlocked(interaction, valor, longName)
                                            status = "Banco Bloqueado"
                                            msg.edit({ embeds: [embedd], components: [], content: ``})
                                            return;
                                        }
                                        status = "Aprovado"
                                        const embedd = new EmbedBuilder()
                                        .setAuthor({ name: `❌ Erro na compra!`, iconURL: interaction.guild.iconURL({})})
                                        .setColor("Red")
                                        .setDescription(`Olá ${interaction.user}.\n- Notificamos que você está utilizando o banco **${longName}**.\n> Infelizmente, este banco está bloqueado em nossos registros pelos administradores do servidor.\n> Não se preocupe! Seu dinheiro já foi reembolsado. Se desejar adquirir o produto, por favor, utilize outro banco para realizar a compra.`)
                                        .setThumbnail(interaction.user.displayAvatarURL({}))
                                        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({})})
                                        .setTimestamp()
                                        sendMessagePixBlocked(interaction, valor, longName)
                                        status = "Banco Bloqueado"
                                        msg.edit({ content: `${interaction.user}`, embeds: [embedd], components: [], content: ``})
                                        sendMessagePixSucesso(interaction, valor, doc)
                                    }
                                })
                            }, 10000)
                            status = 2
                            setTimeout(() => {
                                if (status === 2) {
                                    sendMessagePixExpirado(interaction, valor)
                                    msg.delete()
                                    interaction.channel.send({ content: `${dbe.get("13")} | Pagamento expirado!`})
                                }
                            }, 1000 * 60 * 20);
                            const min = moment().add(20, 'minutes');
                            const time = Math.floor(min.valueOf() / 1000);

                            const embed = new EmbedBuilder()
                            .setAuthor({ name: `Pagamento Gerado!`, iconURL: interaction.user.displayAvatarURL()})
                            .setColor(dbc.get("color"))
                            .setDescription(`👋 Olá ${interaction.user}\n- Seu pagamento foi gerado com sucesso! Veja à seguir as informações:`)
                            .addFields(
                                { name: `Valor:`, value: `R$${await formatValor(valor)}`, inline:true },
                                { name: `Data / Horário:`, value: `<t:${time}:f> \n(<t:${~~(new Date() / 1000)}:R>)`, inline:true }
                            )

                            const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setLabel('Pix Copia e Cola')
                                .setEmoji(dbep.get("32"))
                                .setCustomId(`cpc`)
                                .setDisabled(false)
                                .setStyle(1),
                                new ButtonBuilder()
                                .setLabel('Qr Code')
                                .setEmoji(dbep.get("33"))
                                .setCustomId(`qrc`)
                                .setDisabled(false)
                                .setStyle(1),
                                new ButtonBuilder()
                                .setEmoji(dbep.get("37"))
                                .setCustomId(`cancelarpix`)
                                .setDisabled(false)
                                .setStyle(4)
                            )
                            const { qrGenerator } = require('./lib__QRCodeLib.js')
                            const qr = new qrGenerator({ imagePath: './lib__zend.png' })
                            const qrcode = await qr.generate(data.point_of_interaction.transaction_data.qr_code)
            
                            const buffer = Buffer.from(qrcode.response, "base64");
                            const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });
                            await msg.edit({ content: ``, embeds: [embed], components: [row]}).then(async(msg) => {
                                const collector = msg.createMessageComponentCollector({componentType: Discord.ComponentType.Button,})
                                collector.on('collect', interaction2 => {
                                    if (interaction2.user.id === interaction.user.id) {
                                        if (interaction2.customId === "cpc") {
                                            interaction2.reply({ content: `${data.point_of_interaction.transaction_data.qr_code}`, flags: 64 });
                                        }
                                        if (interaction2.customId === "qrc") {
                                            interaction2.reply({ files: [attachment], flags: 64 });
                                        }
                                    } else {
                                        interaction2.reply({ flags: 64, content: `${dbe.get("13")} | Só o ${interaction.user} pode mexer aqui!`})
                                    }
                                })
                            })
                        })
                        .catch(async function(error) {
                            await msg.edit({ content: ``, embeds: [embed], components: [row]})
                            interaction.followUp({ content: `${dbe.get("13")} | Ocorreu um erro ao gerar o pagamento!`, flags: 64})
                        });
                    }
                })
            })







            const aa = false
            if (aa) {
                var payment_data = {
                    transaction_amount: Number(valor),
                    description: `Cobrança Gerada - ${interaction.user.username}`,
                    payment_method_id: 'pix',
                    payer: {
                    email: `${dbc.get(`email`) || "asaphs595@gmail.com"}`,
                    first_name: 'Paula',
                    last_name: 'Guimaraes',
                    identification: {
                        type: 'CPF',
                        number: '07944777984'
                    },
                    address: {
                        zip_code: '06233200',
                        street_name: 'Av. das NaÃƒÂ§oes Unidas',
                        street_number: '3003',
                        neighborhood: 'Bonfim',
                        city: 'Osasco',
                        federal_unit: 'SP'
                    }
                    },
                    notification_url: interaction.user.displayAvatarURL(),
                }
        
                payment.create({ body: payment_data}).then(function (data) {
                    const min = moment().add(20, 'minutes');
                    const time = Math.floor(min.valueOf() / 1000);
        
                    const checkPaymentStatus = setInterval(() => {
                        axios.get(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                            headers: {
                                'Authorization': `Bearer ${dbc.get(`pagamentos.acess_token`)}`
                            }
                        }).then(async (doc) => {
                            const paymentGet = await payment.get({ id: data.id });
                            const paymentStatus = paymentGet.status;
                            
                            if (paymentStatus === "approved") {
                                const longName = doc.data.point_of_interaction.transaction_data.bank_info.payer.long_name || 'N/A'
                                const containsTerm = dbc.get("pagamentos.blockbank").some(term => longName.toLowerCase().includes(term.toLowerCase()));
                                if(containsTerm) {
                                    clearInterval(checkPaymentStatus)
            
                                    refund.create({
                                        payment_id: doc.data.id,
                                        body: {}
                                    })
                                    
            
                                    const embedd = new EmbedBuilder()
                                    .setDescription(`> Olá ${interaction.user}, **obrigado por comprar conosco!** Infelizmente, detectamos que o banco que você usou para realizar o pagamento está na nossa lista de bancos proibidos, devido a problemas anteriores de fraude ou inadimplência. Por isso, **não podemos concluir a sua compra** e vamos estornar o valor pago para a sua conta. Pedimos desculpas pelo transtorno e sugerimos que você tente usar outro banco ou forma de pagamento. Caso tenha alguma dúvida ou reclamação, entre em contato com o nosso suporte.`)
                                    .setColor("Red")
            
                                    msg.edit({ embeds: [embedd], components: []})
                                    return;
                                }
                                db3.set(`${data_id}.status`, "aprovado")
                            }
                            if(db3.get(`${data_id}.status`) === "aprovado") {
                                clearInterval(checkPaymentStatus)
                                msg.edit({ content: `${emj.get(`6`)} | Pagamento aprovado.`, embeds: [], components: [] })
                            }
                        })
                    }, 10000)
                    const buffer = Buffer.from(data.point_of_interaction.transaction_data.qr_code_base64, "base64");
                    const attachment = new AttachmentBuilder(buffer, "payment.png");
                    
                    const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel('Pix Copia e Cola')
                        .setEmoji(`<:PIX:1197144743822499881>`)
                        .setCustomId(`cpc`)
                        .setDisabled(false)
                        .setStyle(1),
                        new ButtonBuilder()
                        .setLabel('Qr Code')
                        .setEmoji(`<:QRCODE:1197144788215013486>`)
                        .setCustomId(`qrc`)
                        .setDisabled(false)
                        .setStyle(1),
                        new ButtonBuilder()
                        .setEmoji(`<:errado1:1216480328743518401>`)
                        .setCustomId(`cancelarpix`)
                        .setDisabled(false)
                        .setStyle(4)
                    )
                    const embed = new EmbedBuilder()
                    .setAuthor({ name: `Pagamtento Automático`, iconURL: interaction.guild.iconURL({ dynamic:true })})
                    .setThumbnail(interaction.guild.iconURL({ dynamic:true }))
                    .setColor(dbcv.get(`color`) || "Default")
                    .addFields(
                        {
                            name: `Valor:`,
                            value: `R$${valor.toFixed(2)}`,
                            inline:true
                        },
                        {
                            name: `Pagamento expira em:`,
                            value: `<t:${time}:f> (<t:${time}:R>)`,
                            inline:true
                        }
                    )
                    
                    msg.edit({ content: ``, embeds: [embed], components: [row], flags: 64 }).then(msg => {
                        setTimeout(() => {
                            clearInterval(checkPaymentStatus)
                            msg.edit({ embeds: [], components: [], content: `${dbe.get(`13`)} | Tempo expirado... Use o comando novamente`})
                        }, 1000 * 60 * 10);
                        const collector = msg.createMessageComponentCollector({componentType: Discord.ComponentType.Button,})
                        collector.on('collect', interaction2 => {
                            
                            if (interaction2.customId == 'cpc') {
                              interaction2.reply({ content: `${data.point_of_interaction.transaction_data.qr_code}`, flags: 64 });
                            }
                            
                            if (interaction2.customId == 'qrc') {
                              interaction2.reply({ files: [attachment], flags: 64 });
                            }
                            
                            if (interaction2.customId == 'cancelarpix') {
                                db3.set(`${data_id}.status`, "cancelado")
                                interaction2.message.edit({ content: `${dbe.get(`13`)} | Pagamento Cancelado`, embeds: [], components: [], flags: 64 }).then(msg => {
                                    setTimeout(() => {
                                        msg.delete()
                                    }, 5000);
                                })
                            }
                        }) 
                        db3.set(`${data_id}.status`, "Pendente (2)")
                    })
                })
            }
        }
    }
}
