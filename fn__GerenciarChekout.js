const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Attachment, AttachmentBuilder} = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json"})
const dc = new JsonDatabase({ databasePath: "./data__carrinho.json"})
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json"})
const dbcg = new JsonDatabase({ databasePath: "./data__configGlob.json"})
const dbp = new JsonDatabase({ databasePath: "./data__personalizados.json"})
const dbs = new JsonDatabase({ databasePath: "./data__saldo.json"})
const db = new JsonDatabase({ databasePath: "./data__produtos.json"})
const dbr = new JsonDatabase({ databasePath: "./data__rendimentos.json"})
const dbru = new JsonDatabase({ databasePath: "./data__rankUsers.json"})
const dbrp = new JsonDatabase({ databasePath: "./data__rankProdutos.json"})
const dbcp = new JsonDatabase({ databasePath: "./data__perfil.json"})
const fs = require("fs")
const path = require("path")
const https = require("https");
const axios = require("axios");
const Discord = require("discord.js")
const moment = require("moment")
moment.locale("pt-br");
const dbep = new JsonDatabase({ databasePath: "./data__emojisGlob.json"})
const { updateEspecifico, sendMessage } = require("./fn__UpdateMessageBuy.js")
const { bloquearBanco, enviarProduto, deleteMessages } = require("./fn__CarrinhoAprovado.js")

/////// MERCADO PAGO //////

async function formatValor(valor) {
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function paymentMP(interaction, msg, produto, valor) {
    const { MercadoPagoConfig, Payment, PaymentRefund } = require("mercadopago");
    try {
        const access_token = await dbc.get(`pagamentos.acess_token`);
        const client = new MercadoPagoConfig({ accessToken: `${access_token}` });
        const payment = new Payment(client);
        const carrinho = dc.get(`${interaction.channel.id}`)
        
        const payment_data = {
            transaction_amount: Number(valor),
            description: `Cobrança produto: ${produto.nome} (${interaction.user.username})`,
            payment_method_id: 'pix',
            payer: {
                email: 'zendapplications@gmail.com'
            },
        }

        await msg.edit({ content: `${dbe.get("16")} | Gerando pagamento...` });

        const data = await payment.create({ body: payment_data });

        const embed = new EmbedBuilder()
            .setAuthor({ name: `🛒 Carrinho criado!`, iconURL: interaction.user.displayAvatarURL({}) })
            .setColor(dbc.get("color"))
            .setDescription(`Olá ${interaction.user} 👋\n- Você abriu um carrinho!`)
            .addFields(
                { name: `Detalhes do carrinho:`, value: `\`${dc.get(`${interaction.channel.id}.quantidade`)}x\` __${produto.nome}__ | R$${await formatValor(valor)}` }
            )
            .setThumbnail(interaction.user.displayAvatarURL({}))
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({}) })
            .setTimestamp();

        const cliente = interaction.guild.members.cache.get(dc.get(`${interaction.channel.id}.user`));
        if (cliente) await cliente.send({ embeds: [embed] }).catch(() => {})

        return {
            data: data,
            acess_token: access_token
        };
    } catch (err) {
        console.error("Erro ao processar o pagamento:", err);
        await msg.edit({ content: `${dbe.get("13")} | Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.` });
        return "error";
    }
}

async function paymentMPError(interaction, msg, produto, valor) {    
    let emjpix = dbep.get(`39`)
    let emjpay = dbep.get(`40`)
    let emjvol = dbep.get(`29`)
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setStyle(2)
        .setCustomId(`${interaction.channel.id}_pagarpix`)
        .setLabel(`Pix`)
        .setEmoji(emjpix),
        new ButtonBuilder()
        .setStyle(2)
        .setCustomId(`${interaction.channel.id}_paypal`)
        .setLabel(`PayPal`)
        .setDisabled(true)
        .setEmoji(emjpay),
        new ButtonBuilder()
        .setStyle(1)
        .setCustomId(`${interaction.channel.id}_carrinhovoltar`)
        .setLabel(`Voltar`)
        .setEmoji(emjvol)
    )
    await msg.edit({ embeds: [], content: `Escolha qual a forma de pagamento.`, components: [row]})
    interaction.followUp({ content: `${dbe.get("13")} | Ocorreu um erro ao tentar gerar pagamento. Tente novamente.`, flags: 64})
}

async function paymentEfiPay(interaction, msg, produto, valor) {
    const carrinho = dc.get(`${interaction.channel.id}`)
try {
    await msg.edit({ content: `${dbe.get("16")} | Gerando pagamento...` });
    let certificado = fs.readFileSync(`./Lib/${dbc.get(`pagamentos.certificado`) ? dbc.get(`pagamentos.certificado`) : "undefinied"}.p12`);

    const httpsAgent = new https.Agent({
        pfx: certificado,
        passphrase: "",
    });

    var data = JSON.stringify({ grant_type: "client_credentials" });
    var data_credentials = dbc.get(`pagamentos.secret_id`) + ":" + dbc.get(`pagamentos.secret_token`);
    var auth = Buffer.from(data_credentials).toString("base64");


    var config = {
        method: "POST",
        url: "https://pix.api.efipay.com.br/oauth/token",
        headers: {
            Authorization: "Basic " + auth,
            "Content-Type": "application/json",
        },
        httpsAgent: httpsAgent,
        data: data,
    };
    const embed = new EmbedBuilder()
    .setAuthor({ name: `🛒 Carrinho criado!`, iconURL: interaction.user.displayAvatarURL({}) })
    .setColor(dbc.get("color"))
    .setDescription(`Olá ${interaction.user} 👋\n- Você abriu um carrinho!`)
    .addFields(
        { name: `Detalhes do carrinho:`, value: `\`${carrinho.quantidade}x ${produto.nome} | R$${await formatValor(valor)} \`` }
    )
    .setThumbnail(interaction.user.displayAvatarURL({}))
    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({}) })
    .setTimestamp();

    const cliente = interaction.guild.members.cache.get(dc.get(`${interaction.channel.id}.user`));
    if (cliente) await cliente.send({ embeds: [embed] }).catch(() => {})

    let access_token = await axios(config).then(function (response) {
        return response.data.access_token
    }).catch(function (error) {
        console.log(`Novo erro: ${error}`)
    })

    interaction.editReply({ content: ` Espere só mais um pouco...`, flags: 64, components: [], embeds: [] })


    var data = JSON.stringify({
        "calendario": {
            "expiracao": 10 * 60
        },
        "devedor": {
            "cpf": "65583988002",
            "nome": `${interaction.user.username}`,
        },
        "valor": {
            "original": `${valor}`,
        },
        "chave": `${dbc.get(`pagamentos.chavepix`)}`,
        "solicitacaoPagador": "Cobrança dos serviços prestados."
    });

    var config = {
        method: "post",
        url: "https://pix.api.efipay.com.br/v2/cob",
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json"
        },
        httpsAgent: httpsAgent,
        data: data,
    };

    let response = await axios(config).then(function (response) {
        return response.data
    }).catch(function (error) {
        console.log(error.response.data)
    })


        return {
            data: response,
            acess_token: access_token
        };
} catch (error) {
    console.log(error)
    paymentMPError(interaction, msg, produto, valor)
}
}

async function paymentEfiPaySales(interaction, msg, produto, valor) {
    const carrinho = dc.get(`${interaction.channel.id}`)
    try {
        await msg.edit({ content: `${dbe.get("16")} | Gerando pagamento...` });
        let certificado = fs.readFileSync(`./Lib/${dbc.get(`esales.certificado`) ? dbc.get(`esales.certificado`) : "undefinied"}.p12`);
    
        const httpsAgent = new https.Agent({
            pfx: certificado,
            passphrase: "",
        });
    
        var data = JSON.stringify({ grant_type: "client_credentials" });
        var data_credentials = dbc.get(`esales.secret_id`) + ":" + dbc.get(`esales.secret_token`);
        var auth = Buffer.from(data_credentials).toString("base64");
    
    
        var config = {
            method: "POST",
            url: "https://pix.api.efipay.com.br/oauth/token",
            headers: {
                Authorization: "Basic " + auth,
                "Content-Type": "application/json",
            },
            httpsAgent: httpsAgent,
            data: data,
        };
        const embed = new EmbedBuilder()
        .setAuthor({ name: `🛒 Carrinho criado!`, iconURL: interaction.user.displayAvatarURL({}) })
        .setColor(dbc.get("color"))
        .setDescription(`Olá ${interaction.user} 👋\n- Você abriu um carrinho!`)
        .addFields(
            { name: `Detalhes do carrinho:`, value: `\`${carrinho.quantidade}x ${produto.nome} | R$${await formatValor(valor)} \`` }
        )
        .setThumbnail(interaction.user.displayAvatarURL({}))
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({}) })
        .setTimestamp();

        const cliente = interaction.guild.members.cache.get(dc.get(`${interaction.channel.id}.user`));
        if (cliente) await cliente.send({ embeds: [embed] }).catch(() => {})

        let access_token = await axios(config).then(function (response) {
            return response.data.access_token
        }).catch(function (error) {
            console.log(`Novo erro: ${error}`)
        })
    
        interaction.editReply({ content: ` Espere só mais um pouco...`, flags: 64, components: [], embeds: [] })
    
    
        var data = JSON.stringify({
            "calendario": {
                "expiracao": 10 * 60
            },
            "devedor": {
                "cpf": "65583988002",
                "nome": `${interaction.user.username}`,
            },
            "valor": {
                "original": `${valor}`,
            },
            "chave": `${dbc.get(`esales.chavepix`)}`,
            "solicitacaoPagador": "Cobrança dos serviços prestados."
        });
    
        var config = {
            method: "post",
            url: "https://pix.api.efipay.com.br/v2/cob",
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
            httpsAgent: httpsAgent,
            data: data,
        };
    
        let response = await axios(config).then(function (response) {
            return response.data
        }).catch(function (error) {
            console.log(error.response.data)
        })
    
    
            return {
                data: response,
                acess_token: access_token
            };
    } catch (error) {
        console.log(error)
        paymentMPError(interaction, msg, produto, valor)
    }
    }

module.exports = {
    paymentMP,
    paymentMPError,
    paymentEfiPay,
    paymentEfiPaySales
}