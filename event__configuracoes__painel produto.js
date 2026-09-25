const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Attachment, AttachmentBuilder } = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json" })
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json" })
const dbp = new JsonDatabase({ databasePath: "./data__personalizados.json" })
const dbcp = new JsonDatabase({ databasePath: "./data__cupons.json" })
const dbr = new JsonDatabase({ databasePath: "./data__rendimentos.json" })
const moment = require("moment")
moment.locale("pt-br");
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');
const db = new JsonDatabase({ databasePath: "./data__produtos.json" })
const Discord = require("discord.js")
const dbep = new JsonDatabase({ databasePath: "./data__emojisGlob.json" })
const cfg = new JsonDatabase({ databasePath: "./data__configGlob.json" })
const { updateEspecifico, sendMessage } = require("./fn__UpdateMessageBuy.js")


module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {

        if (interaction.customId === "config_cupom") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Configurando Cupons`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`👋 Olá ${interaction.user}.\n- Configure os cupons globais dos seus produtos!`)
                .setFields(
                    { name: `Quantidade de cupons:`, value: `${await dbcp.all().length} cupom(ns) registrados.`, inline: false }
                )

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId("config_cupom_adicionar")
                        .setLabel("Adicionar")
                        .setEmoji(dbep.get("20")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_cupom_configurar")
                        .setLabel("Configurar Cupons")
                        .setEmoji(dbep.get("10"))
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(4)
                        .setCustomId("config_cupom_limpar")
                        .setLabel("Deletar Cupons")
                        .setEmoji(dbep.get("23")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_produtos_voltar")
                        .setLabel("Voltar")
                        .setEmoji(dbep.get("29"))
                )
            interaction.update({ embeds: [embed], components: [row, row2] })
        }

        if (interaction.customId === "config_cupom_limpar") {
            const cupons = await dbcp.all();
            if (cupons.length === 0) {
                return interaction.reply({ content: `${dbe.get("13")} | Nenhum cupom registrado!`, flags: 64 });
            }
            const select = new StringSelectMenuBuilder()
                .setCustomId("select_config_cupom_deletar")
                .setPlaceholder("Selecione um cupom para deletar.")
                .setMinValues(1)
                .setMaxValues(cupons.length)

            await cupons.map(async (entry) => {
                await select.addOptions(
                    {
                        label: `${entry.data.nome}`,
                        description: `Desconto de ${entry.data.desconto}%`,
                        value: `${entry.data.nome}`
                    }
                );
            });

            const row = new ActionRowBuilder()
                .addComponents(select);

            interaction.update({ components: [row] });
        }

        if (interaction.isStringSelectMenu() && interaction.customId === "select_config_cupom_deletar") {
            const cuponsSelecionados = interaction.values;
            let cuponsNaoEncontrados = [];

            cuponsSelecionados.forEach(cupomNome => {
                const cupom = dbcp.get(cupomNome);
                if (cupom) {
                    dbcp.delete(cupomNome);
                } else {
                    cuponsNaoEncontrados.push(cupomNome);
                }
            });

            if (cuponsNaoEncontrados.length > 0) {
                interaction.reply({ content: `${dbe.get("6")} | Cupons não encontrados: ${cuponsNaoEncontrados.join(", ")}`, flags: 64 });
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `Configurando Cupons`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`👋 Olá ${interaction.user}.\n- Configure os cupons globais dos seus produtos!`)
                    .setFields(
                        { name: `Quantidade de cupons:`, value: `${await dbcp.all().length} cupom(ns) registrados.`, inline: false }
                    )

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId("config_cupom_adicionar")
                            .setLabel("Adicionar")
                            .setEmoji(dbep.get("20")),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId("config_cupom_configurar")
                            .setLabel("Configurar Cupons")
                            .setEmoji(dbep.get("10"))
                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId("config_cupom_limpar")
                            .setLabel("Limpar Cupons")
                            .setEmoji(dbep.get("23")),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId("config_produtos_voltar")
                            .setLabel("Voltar")
                            .setEmoji(dbep.get("29"))
                    )
                await interaction.update({ embeds: [embed], components: [row, row2] })
                await interaction.followUp({ content: `${dbe.get("6")} | Cupons Deletados com sucesso!`, flags: 64 });
            }
        }



        if (interaction.customId === "config_cupom_configurar") {

            const cupons = await dbcp.all();
            if (cupons.length === 0) {
                return interaction.reply({ content: `${dbe.get("13")} | Nenhum cupom registrado!`, flags: 64 });
            }
            const select = new StringSelectMenuBuilder()
                .setCustomId("select_config_cupom_configurar")
                .setPlaceholder("Selecione um cupom para configurar.")
                .setMaxValues(1);

            await cupons.map(async (entry) => {
                await select.addOptions(
                    {
                        label: `${entry.data.nome}`,
                        description: `Desconto de ${entry.data.desconto}%`,
                        value: `${entry.data.nome}`
                    }
                );
            });

            const row = new ActionRowBuilder()
                .addComponents(select);
            const rowvol = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setStyle(1)
                .setCustomId("config_cupom")
                .setLabel("Voltar")
                .setEmoji(dbep.get("29"))
            )
            interaction.update({ components: [row, rowvol] });
        }

        if (interaction.isStringSelectMenu() && interaction.customId === "select_config_cupom_configurar") {
            const cupomNome = interaction.values[0];
            const cupom = dbcp.get(cupomNome) || [];

            const modal = new ModalBuilder()
                .setCustomId(`${cupomNome}_modaledit`)
                .setTitle("Editando Cupom");

                const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Nome:")
                .setPlaceholder("Informe o nome do cupom.")
                .setStyle(1)
                .setValue(cupom.nome || "")
                .setMaxLength(25)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("ID Cargo:")
                .setPlaceholder("Informe ID do cargo que poderá usar o cupom.")
                .setStyle(1)
                .setValue(cupom.cargo || "")
                .setRequired(false)
                .setMaxLength(25)

            const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setLabel("Porcentagem:")
                .setPlaceholder("Informe a porcentagem de desconto do cupom.")
                .setValue(cupom.desconto || "")
                .setStyle(1)

            const text4 = new TextInputBuilder()
                .setCustomId("text4")
                .setLabel("Valor Máximo:")
                .setPlaceholder("Informe o valor máximo para usar o cupom.")
                .setValue(cupom.valormax || "")
                .setRequired(false)
                .setStyle(1)

            const text5 = new TextInputBuilder()
                .setCustomId("text5")
                .setLabel("Valor Mínimo:")
                .setPlaceholder("Informe o valor mínimo para usar o cupom.")
                .setValue(cupom.valormin || "")
                .setRequired(false)
                .setStyle(1)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            modal.addComponents(new ActionRowBuilder().addComponents(text3))
            modal.addComponents(new ActionRowBuilder().addComponents(text4))
            modal.addComponents(new ActionRowBuilder().addComponents(text5))

            return interaction.showModal(modal)
        }

        if (interaction.isModalSubmit() && interaction.customId.endsWith('_modaledit')) {
            const nome = interaction.fields.getTextInputValue("text1")
            const idCargo = interaction.fields.getTextInputValue("text2")
            const porcentagem = interaction.fields.getTextInputValue("text3")
            const valormax = interaction.fields.getTextInputValue("text4")
            const valormin = interaction.fields.getTextInputValue("text5")
            const cargo = interaction.guild.roles.cache.get(idCargo)

            if (dbcp.get(`${nome}`)) {
                return interaction.reply({ content: `${dbe.get("13")} | Cupom já existente!`, flags: 64 });
            }

            if (!cargo) {
                return interaction.reply({ content: `${dbe.get(`13`)} | Insira um cargo valido`, flags: 64 })
            }

            if (isNaN(porcentagem)) return interaction.reply({ content: `${dbe.get(`13`)} | Porcentagem inválida!`, flags: 64 })
            if (isNaN(valormax)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor máximo inválido!`, flags: 64 })
            if (isNaN(valormin)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor Mínimo inválido!`, flags: 64 })
            if (porcentagem > 99) return interaction.reply({ content: `${dbe.get(`13`)} | A porcentagem só pode ir até em **99%**!`, flags: 64 })

            let id = interaction.customId.split("_")[0];
            dbcp.delete(id)   
            dbcp.set(`${nome}`, { desconto: porcentagem, nome: nome, cargo: idCargo, valormax: valormax, valormin: valormin, });

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Configurando Cupons`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`👋 Olá ${interaction.user}.\n- Configure os cupons globais dos seus produtos!`)
                .setFields(
                    { name: `Quantidade de cupons:`, value: `${await dbcp.all().length} cupom(ns) registrados.`, inline: false }
                )

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId("config_cupom_adicionar")
                        .setLabel("Adicionar")
                        .setEmoji(dbep.get("20")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_cupom_configurar")
                        .setLabel("Configurar Cupons")
                        .setEmoji(dbep.get("10"))
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(4)
                        .setCustomId("config_cupom_limpar")
                        .setLabel("Limpar Cupons")
                        .setEmoji(dbep.get("23")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_produtos_voltar")
                        .setLabel("Voltar")
                        .setEmoji(dbep.get("29"))
                )
            await interaction.update({ embeds: [embed], components: [row, row2] })
            await interaction.followUp({ content: `${dbe.get("6")} | Cupom editado com sucesso!`, flags: 64 });
        }


        if (interaction.customId === "config_cupom_adicionar") {
            const cupons = await dbcp.all()
            if (cupons.length > 24) {
                return interaction.reply({ content: `${dbe.get("13")} | Limite de cupons atingido!`, flags: 64 });
            }
            const modal = new ModalBuilder()
                .setCustomId("modal_config_cupom_adicionar")
                .setTitle("Adicionando Cupom")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Nome:")
                .setPlaceholder("Informe o nome do cupom.")
                .setStyle(1)
                .setMaxLength(25)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("ID Cargo:")
                .setPlaceholder("Informe ID do cargo que poderá usar o cupom.")
                .setStyle(1)
                .setRequired(false)
                .setMaxLength(25)

            const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setLabel("Porcentagem:")
                .setPlaceholder("Informe a porcentagem de desconto do cupom.")
                .setStyle(1)

            const text4 = new TextInputBuilder()
                .setCustomId("text4")
                .setLabel("Valor Máximo:")
                .setPlaceholder("Informe o valor máximo para usar o cupom.")
                .setRequired(false)
                .setStyle(1)

            const text5 = new TextInputBuilder()
                .setCustomId("text5")
                .setLabel("Valor Mínimo:")
                .setPlaceholder("Informe o valor mínimo para usar o cupom.")
                .setRequired(false)
                .setStyle(1)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            modal.addComponents(new ActionRowBuilder().addComponents(text3))
            modal.addComponents(new ActionRowBuilder().addComponents(text4))
            modal.addComponents(new ActionRowBuilder().addComponents(text5))

            return interaction.showModal(modal)
        }
        if (interaction.isModalSubmit() && interaction.customId === "modal_config_cupom_adicionar") {
            const nome = interaction.fields.getTextInputValue("text1")
            const idCargo = interaction.fields.getTextInputValue("text2")
            const porcentagem = interaction.fields.getTextInputValue("text3")
            const valormax = interaction.fields.getTextInputValue("text4")
            const valormin = interaction.fields.getTextInputValue("text5")
            const cargo = interaction.guild.roles.cache.get(idCargo)

            if (dbcp.get(`${nome}`)) {
                return interaction.reply({ content: `${dbe.get("13")} | Cupom já existente!`, flags: 64 });
            }

            if (!cargo) {
                return interaction.reply({ content: `${dbe.get(`13`)} | Insira um cargo valido`, flags: 64 })
            }

            if (isNaN(porcentagem)) return interaction.reply({ content: `${dbe.get(`13`)} | Porcentagem inválida!`, flags: 64 })
            if (isNaN(valormax)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor máximo inválido!`, flags: 64 })
            if (isNaN(valormin)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor Mínimo inválido!`, flags: 64 })
            if (porcentagem > 99) return interaction.reply({ content: `${dbe.get(`13`)} | A porcentagem só pode ir até em **99%**!`, flags: 64 })


            // Se todas as condições forem atendidas, prossiga com a criação do cupom
            dbcp.set(`${nome}`, { desconto: porcentagem, nome: nome, cargo: idCargo, valormax: valormax, valormin: valormin, });
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Configurando Cupons`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`👋 Olá ${interaction.user}.\n- Configure os cupons globais dos seus produtos!`)
                .setFields(
                    { name: `Quantidade de cupons:`, value: `${await dbcp.all().length} cupom(ns) registrados.`, inline: false }
                )

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId("config_cupom_adicionar")
                        .setLabel("Adicionar")
                        .setEmoji(dbep.get("20")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_cupom_configurar")
                        .setLabel("Configurar Cupons")
                        .setEmoji(dbep.get("10"))
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(4)
                        .setCustomId("config_cupom_limpar")
                        .setLabel("Limpar Cupons")
                        .setEmoji(dbep.get("23")),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId("config_produtos_voltar")
                        .setLabel("Voltar")
                        .setEmoji(dbep.get("29"))
                )
            await interaction.update({ embeds: [embed], components: [row, row2] })
            await interaction.followUp({ content: `${dbe.get("6")} | Cupom criado com sucesso!`, flags: 64 });
        }
        const aa = interaction.customId
        if (interaction.customId === "config_produtos_voltar") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Configurando Vendas", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Escolha abaixo qual sistema de vendas você deseja configurar.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .setImage(cfg.get("imgVendas"))
            let emjcai = dbep.get(`35`)
            let emjfer = dbep.get(`5`)
            let emjbol = dbep.get(`3`)

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos`)
                        .setLabel(`Painéis`)
                        .setEmoji(emjcai),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso`)
                        .setLabel("Personalizar")
                        .setEmoji(emjfer),
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId("config_cupom")
                        .setLabel("Cupons")
                        .setDisabled(false)
                        .setEmoji(dbep.get(`24`)),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_rendimentos`)
                        .setLabel("Rendimentos")
                        .setEmoji(emjbol),
                );
            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_hierarquiacargo`)
                        .setLabel("Hierarquia de Cargos")
                        .setEmoji(dbep.get(`24`)),
                )
            interaction.update({ embeds: [embed], components: [row1, row2, row3], content: "", flags: 64 })
        }
        async function atthierarquia(interaction) {
            const cargosdb = dbc.get(`hierarquia.cargos`) || [];
            cargosdb.sort((a, b) => b.valorcompras - a.valorcompras); // Ordena do maior para o menor valor de compras

            let cargos = ''; // Inicializando a variável cargos

            // Itera sobre os cargos ordenados e adiciona à string `cargos`
            await Promise.all(cargosdb.map(async (entry) => {
                cargos += `- O cargo <@&${entry.cargo}> será atingir o valor de **R$${Number(entry.valorcompras).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.\n`;
            }));

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Hierarquia de Cargos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Configure a hierarquia de cargos. Ela serve para incentivar os clientes à comprarem na sua loja. Após eles fizerem um certo número de compras ou atingir um valor, eles recebem um cargo que foi definido aqui.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Sistema:`, value: `${dbc.get(`hierarquia.sistema`) === "ON" ? "`🟢 Ligado`" : "`🔴 Desligado`"}`, inline: true },
                    { name: `Tirar Cargos Anteriores?`, value: `${dbc.get(`hierarquia.tirarcargo`) === "ON" ? `\`✅ Sim\`` : `\`❌ Não\``}`, inline: true },
                    { name: `Hierarquia:`, value: `${cargos || "Não Definido."}`, inline: false }
                )

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(dbc.get(`hierarquia.sistema`) === "ON" ? 3 : 4)
                        .setCustomId(`config_hierarquiacargo_sistema`)
                        .setLabel(`Sistema ${dbc.get(`hierarquia.sistema`) === "ON" ? "Ligado" : "Desligado"}`)
                        .setEmoji(dbc.get(`hierarquia.sistema`) === "ON" ? dbep.get(`4`) : dbep.get(`2`)),
                    new ButtonBuilder()
                        .setStyle(dbc.get(`hierarquia.tirarcargo`) === "ON" ? 3 : 4)
                        .setCustomId(`config_hierarquiacargo_tirarcargo`)
                        .setLabel(`Tirar Cargo (Definido como ${dbc.get(`hierarquia.tirarcargo`) === "ON" ? "Sim" : "Não"})`)
                        .setEmoji(dbc.get(`hierarquia.tirarcargo`) === "ON" ? dbep.get(`4`) : dbep.get(`2`)),
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(3)
                        .setCustomId(`config_hierarquiacargo_addcargo`)
                        .setLabel(`Adicionar Cargo`)
                        .setEmoji(dbep.get(`24`)),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_hierarquiacargo_configcargo`)
                        .setLabel(`Configurar Cargo`)
                        .setEmoji(dbep.get(`10`)),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(dbep.get(`29`)),
                )
            await interaction.update({ content: ``, embeds: [embed], components: [row, row2] })
        }
        if (aa === "config_hierarquiacargo") {
            atthierarquia(interaction)
        }
        if (aa === "config_hierarquiacargo_sistema") {
            dbc.get(`hierarquia.sistema`) === "ON" ? dbc.set(`hierarquia.sistema`, "OFF") : dbc.set(`hierarquia.sistema`, "ON")
            atthierarquia(interaction)
        }
        if (aa === "config_hierarquiacargo_tirarcargo") {
            dbc.get(`hierarquia.tirarcargo`) === "ON" ? dbc.set(`hierarquia.tirarcargo`, "OFF") : dbc.set(`hierarquia.tirarcargo`, "ON")
            atthierarquia(interaction)
        }
        if (aa === "config_hierarquiacargo_configcargo") {
            const cargos = dbc.get(`hierarquia.cargos`) || []
            if (cargos.length === 0) {
                interaction.reply({ content: `${dbe.get('13')} | Não tem nenhum cargo configurado!`, flags: 64 })
                return;
            }
            const select = new StringSelectMenuBuilder()
                .setCustomId("config_hierarquiacargo_configcargo_select")
                .setPlaceholder(`Selecione um cargo para configurar.`);

            let count = 0;

            await dbc.get(`hierarquia.cargos`).map(async (entry) => {
                if (count >= 25) return; // Limite máximo de 25 opções

                const cargo = interaction.guild.roles.cache.get(entry.cargo); // Verificando cargo em roles, não channels
                if (!cargo) return;

                select.addOptions({
                    label: `Cargo: ${cargo.name}`.slice(0, 100), // Limita a 100 caracteres
                    description: `Será dado após atingir o valor de R$${Number(entry.valorcompras).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`.slice(0, 100), // Limita a 100 caracteres
                    value: `${entry.cargo}`
                });

                count++;
            });

            const row = new ActionRowBuilder().addComponents(select);
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(1)
                    .setCustomId(`config_hierarquiacargo`)
                    .setLabel("Voltar")
                    .setEmoji(dbep.get(`29`))
            );

            interaction.update({
                embeds: [],
                content: `Selecione o cargo para configurar.`,
                components: [row, row2]
            });

        }
        if (interaction.isStringSelectMenu() && aa === "config_hierarquiacargo_configcargo_select") {
            const option = interaction.values[0]
            const cargos = dbc.get(`hierarquia.cargos`) || []
            if (!cargos.find(a => a.cargo === option)) return interaction.reply({ content: `${dbe.get('13')} | Cargo não encontrado!`, flags: 64 });

            const modal = new ModalBuilder()
                .setCustomId(`${option}_config_hierarquiacargo_configcargo_select_modal`)
                .setTitle(`Configurando Cargo`)

            const text1 = new TextInputBuilder()
                .setStyle(1)
                .setCustomId("text1")
                .setLabel(`Valor de Compras`)
                .setPlaceholder(`Escreva o valor à ser atingido para ganhar este cargo.`)
                .setValue(cargos.find(a => a.cargo === option).valorcompras)
            const text2 = new TextInputBuilder()
                .setStyle(1)
                .setCustomId("text2")
                .setRequired(false)
                .setLabel(`Excluir`)
                .setPlaceholder(`Escreva sim caso queira excluir este cargo na hierarquia.`)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            interaction.showModal(modal)
        }
        if (interaction.isModalSubmit() && aa.endsWith("_config_hierarquiacargo_configcargo_select_modal")) {
            const cargoId = aa.split("_")[0]
            const inter = interaction.fields
            let text1
            let text2
            if (inter.getTextInputValue) {
                text1 = inter.getTextInputValue("text1") || ""
                text2 = inter.getTextInputValue("text2") || ""
            }

            if (text2.toLowerCase() === "sim") {
                const edit = dbc.get(`hierarquia.cargos`) || []
                const index = edit.findIndex(a => a.cargo === cargoId)
                edit.splice(index, 1)
                dbc.set(`hierarquia.cargos`, edit)
                await atthierarquia(interaction)
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo modificado com sucesso!`, flags: 64 })
                return
            }

            if (!text1) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Escreva pelo menos um dos requisitos para o cliente ganhar o cargo!` });

            if (text1) {
                if (isNaN(text1)) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Escreva um valor válido!` });

                const edit = dbc.get(`hierarquia.cargos`) || []
                const index = edit.findIndex(a => a.cargo === cargoId)
                edit[index].valorcompras = text1
                dbc.set(`hierarquia.cargos`, edit)
                await atthierarquia(interaction)
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo modificado com sucesso!`, flags: 64 })
            }
        }
        if (aa === "config_hierarquiacargo_addcargo") {
            const select = new ActionRowBuilder()
                .addComponents(
                    new Discord.RoleSelectMenuBuilder()
                        .setCustomId(`config_hierarquiacargo_addcargo_select`)
                        .setMaxValues(1)
                        .setPlaceholder(`Selecione o cargo.`),
                )
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_hierarquiacargo`)
                        .setLabel(`Voltar`)
                        .setEmoji(dbep.get(`29`)),
                )
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `Adicionando Cargo na Hierarquia`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                        .setDescription(`Selecione o cargo que será dado após um cliente bater um certo valor ou quantidade de compras na loja.`)
                        .setColor(dbc.get(`color`) || "Default")
                ], components: [select, row]
            })
        }
        if (interaction.isRoleSelectMenu() && aa === "config_hierarquiacargo_addcargo_select") {
            const cargovalue = interaction.values[0]

            const modal = new ModalBuilder()
                .setCustomId(`${cargovalue}_config_hierarquiacargo_addcargo_select_modal`)
                .setTitle(`Adicionando Cargo`)

            const text1 = new TextInputBuilder()
                .setStyle(1)
                .setCustomId("text1")
                .setLabel(`Valor de Compras`)
                .setPlaceholder(`Escreva o valor à ser atingido para ganhar este cargo.`)
            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            interaction.showModal(modal)
        }
        if (interaction.isModalSubmit() && aa.endsWith("_config_hierarquiacargo_addcargo_select_modal")) {
            const cargoId = aa.split("_")[0]
            const cargos = dbc.get(`hierarquia.cargos`) || []
            if (cargos.find(a => a.cargo === cargoId)) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Esse cargo ja está configurado!` });

            const inter = interaction.fields
            let text1
            if (inter.getTextInputValue) {
                text1 = inter.getTextInputValue("text1") || ""
            }

            if (!text1) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Escreva pelo menos um dos requisitos para o cliente ganhar o cargo!` });

            if (text1) {
                if (isNaN(text1)) return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Escreva um valor válido!` });

                dbc.push(`hierarquia.cargos`, {
                    cargo: cargoId,
                    valorcompras: text1
                })
                await atthierarquia(interaction)
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo adicionado com sucesso!`, flags: 64 })
            }

        }
        if (aa === "config_perso") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalizando Painéis", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Escolha qual o tipo de painel você deseja configurar.\n\n- O **PAINEL BOTÃO** são os painéis que contem apenas um produto cadastrado.\n- O **PAINEL SELECT** são os painéis que contem mais de 1 produtos cadastrados.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Modo de Painel:`, value: `${dbp.get(`modo`) === "embed" ? `\`🟧 Embed\`` : `\`🔘 Mensagem Simples\``}` }
                )

            let emjcoroa = dbep.get(`36`)
            let emjpas = dbep.get(`30`)
            let emjvol = dbep.get(`29`)
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_button`)
                        .setLabel(`Painel Botão`)
                        .setEmoji(emjcoroa),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_select`)
                        .setLabel(`Painel Select`)
                        .setEmoji(emjpas),
                )
            const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setStyle(2)
                .setCustomId(`config_perso_modo`)
                .setEmoji(dbep.get("44"))
                .setLabel(`Alternar Modo`),
                new ButtonBuilder()
                .setStyle(4)
                .setCustomId("config_perso_resetar")
                .setLabel("Resetar")
                .setEmoji(dbep.get("6")),
                new ButtonBuilder()
                .setStyle(1)
                .setCustomId(`config_produtos_voltar`)
                .setLabel("Voltar")
                .setEmoji(emjvol),
            )
            interaction.update({ embeds: [embed], components: [row1, row2] })
        }
        if (aa === "config_perso_modo") {
            dbp.get(`modo`) === "embed" ? dbp.set(`modo`, "mensagem") : dbp.set(`modo`, "embed")

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalizando Painéis", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Escolha qual o tipo de painel você deseja configurar.\n\n- O **PAINEL BOTÃO** são os painéis que contem apenas um produto cadastrado.\n- O **PAINEL SELECT** são os painéis que contem mais de 1 produtos cadastrados.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Modo de Painel:`, value: `${dbp.get(`modo`) === "embed" ? `\`🟧 Embed\`` : `\`🔘 Mensagem Simples\``}` }
                )

            let emjcoroa = dbep.get(`36`)
            let emjpas = dbep.get(`30`)
            let emjvol = dbep.get(`29`)
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_button`)
                        .setLabel(`Painel Botão`)
                        .setEmoji(emjcoroa),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_select`)
                        .setLabel(`Painel Select`)
                        .setEmoji(emjpas),
                )
            const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setStyle(2)
                .setCustomId(`config_perso_modo`)
                .setEmoji(dbep.get("44"))
                .setLabel(`Alternar Modo`),
                new ButtonBuilder()
                .setStyle(4)
                .setCustomId("config_perso_resetar")
                .setLabel("Resetar")
                .setEmoji(dbep.get("6")),
                new ButtonBuilder()
                .setStyle(1)
                .setCustomId(`config_produtos_voltar`)
                .setLabel("Voltar")
                .setEmoji(emjvol),
            )
            interaction.update({ embeds: [embed], components: [row1, row2] })
        }
        if (aa === "config_perso_resetar") {
            const modal = new ModalBuilder()
            .setCustomId("modal_config_perso_resetar")
            .setTitle("Resetando")

            const text1 = new TextInputBuilder()
            .setCustomId("text1")
            .setLabel("Confirmação")
            .setStyle(1)
            .setPlaceholder("Escreva SIM para confirmar.")

            modal.addComponents(new ActionRowBuilder().addComponents(text1))

            await interaction.showModal(modal)
        }
        if (interaction.customId === "modal_config_perso_resetar" && interaction.isModalSubmit()) {
            const text = interaction.fields.getTextInputValue("text1")

            if (text.toLowerCase() !== "sim") return interaction.reply({ content: `${dbe.get("13")} | Você escreveu **SIM** incorretamente!`, flags: 64 });
            
            dbp.set("painel_button", {
                "msg": "{desc}\n\n**Valor:**\n`R${valor}`\n**Disponível:**\n`{estoque}`",
                "button": {
                    "text": "Adquirir",
                    "style": 2,
                    "emoji": "<:sacola:1314603623732350986>"
                },
                "titulo": "{nome}"
            })
            dbp.set("painel_select", {
                "msg": "{desc}",
                "titulo": "{nome}",
                "select": {
                    "text": "{nome}",
                    "desc": "Valor: R${valor} | Disponível: {estoque}",
                    "emoji": "📦",
                    "place": "Selecione um produto."
                }
            })

            interaction.reply({ content: `${dbe.get(`6`)} | Painéis resetados com sucesso!`, flags: 64 })
        }
        if (aa === "config_perso_select") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalizando Painéis", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Personalize a forma que você deseja a mensagem de todos os painéis em select.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Variáveis para usar:`, value: `> {nome}, exibe o nome do produto.\n> {valor}, exibe o valor do produto.\n> {estoque}, exibe o número de produtos no estoque.\n> {desc}, exibe a descrição do produto.` },
                    { name: `Como Usar:`, value: `- Use as variáveis para ficar nos painéis que só tem **2 ou mais produtos cadastrados**.\n- Você poderá usar algumas no título e o resto na descrição. \n- Todos os painéis com 2 ou mais produtos ficarão no mesmo formato que você colocar aqui.` },
                    { name: `Modo de Painel:`, value: `${dbp.get(`modo`) === "embed" ? `\`🟧 Embed\`` : `\`🔘 Mensagem Simples\``}` }
                )

            let emjlap = dbep.get(`1`)
            let emjlup = dbep.get(`15`)
            let emjatt = dbep.get(`6`)
            let emjpas = dbep.get(`30`)
            let emjvol = dbep.get(`29`)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_select_preview`)
                        .setLabel(`Preview`)
                        .setEmoji(emjlup),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_perso_select_editarmsg`)
                        .setLabel(`Editar Mensagem`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_perso_select_editarselect`)
                        .setLabel(`Editar Select`)
                        .setEmoji(emjpas),
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(3)
                        .setCustomId(`config_perso_select_atualizar`)
                        .setLabel(`Atualizar Todos os painéis`)
                        .setEmoji(emjatt),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            interaction.update({ embeds: [embed], components: [row, row2] })
        }
        if (aa === "config_perso_select_editarselect") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_perso_select_editarselect")
                .setTitle("Editando Modelos Selects")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Placeholder")
                .setPlaceholder("Escreva aqui o placeholder do select.")
                .setValue(dbp.get(`painel_select.select.place`) || "")
                .setStyle(1)
                .setRequired(true)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("Texto")
                .setPlaceholder("Escreva aqui o texto do select.")
                .setValue(dbp.get(`painel_select.select.text`) || "")
                .setStyle(1)
                .setRequired(true)

            const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setLabel("Descrição")
                .setPlaceholder("Escreva aqui a descrição dos produtos no select.")
                .setStyle(1)
                .setValue(dbp.get(`painel_select.select.desc`) || "")
                .setRequired(true)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            modal.addComponents(new ActionRowBuilder().addComponents(text3))

            return interaction.showModal(modal)
        }
        if (aa === "config_perso_select_editarmsg") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_perso_select_editarmsg")
                .setTitle("Editando Modelo Mensagem")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Título Padrão")
                .setPlaceholder("Escreva aqui o seu título.")
                .setValue(dbp.get(`painel_select.titulo`) || "")
                .setStyle(1)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("Descrição Padrão")
                .setPlaceholder("Escreva aqui a sua mensagem.")
                .setValue(dbp.get(`painel_select.msg`) || "")
                .setStyle(2)
            if (dbp.get(`modo`) === "embed") {
                modal.addComponents(new ActionRowBuilder().addComponents(text1))
            }
            modal.addComponents(new ActionRowBuilder().addComponents(text2))

            return interaction.showModal(modal)
        }
        if (aa === "config_perso_button") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Personalizando Painéis", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Personalize a forma que você deseja a mensagem de todos os painéis em botão.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Variáveis para usar:`, value: `> {nome}, exibe o nome do produto.\n> {valor}, exibe o valor do produto.\n> {estoque}, exibe o número de produtos no estoque.\n> {desc}, exibe a descrição do produto.` },
                    { name: `Como Usar:`, value: `- Use as variáveis para ficar nos painéis que só tem **1 produto cadastrado**.\n- Você poderá usar algumas no título e o resto na descrição. \n- Todos os painéis com 1 produto cadastrado ficarão no mesmo formato que você colocar aqui.` },
                    { name: `Modo de Painel:`, value: `${dbp.get(`modo`) === "embed" ? `\`🟧 Embed\`` : `\`🔘 Mensagem Simples\``}` }
                )

            let emjlap = dbep.get(`1`)
            let emjlup = dbep.get(`15`)
            let emjatt = dbep.get(`6`)
            let emjcoroa = dbep.get(`36`)
            let emjvol = dbep.get(`29`)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso_button_preview`)
                        .setLabel(`Preview`)
                        .setEmoji(emjlup),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_perso_button_editarmsg`)
                        .setLabel(`Editar Mensagem`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_perso_button_editarbutton`)
                        .setLabel(`Editar Botão`)
                        .setEmoji(emjcoroa),
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(3)
                        .setCustomId(`config_perso_button_atualizar`)
                        .setLabel(`Atualizar Todos os Painéis`)
                        .setEmoji(emjatt),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_perso`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            interaction.update({ embeds: [embed], components: [row, row2] })
        }
        if (aa === "config_perso_button_preview") {
            if (dbp.get(`modo`) === "embed") {
                const embed = new EmbedBuilder()
                let titulo = dbp.get(`painel_button.titulo`);
                let desc = dbp.get(`painel_button.msg`);
                embed.setTitle(titulo)
                embed.setDescription(desc)
                embed.setColor(dbc.get(`color`))
                const button = new ButtonBuilder()
                    .setStyle(dbp.get(`painel_button.button.style`))
                    .setCustomId(`teste`)
                    .setLabel(`${dbp.get(`painel_button.button.text`)}`)

                if (dbp.get(`painel_button.button.emoji`)) {
                    button.setEmoji(dbp.get(`painel_button.button.emoji`))
                }
                const row = new ActionRowBuilder()
                    .addComponents(button)

                interaction.reply({ embeds: [embed], components: [row], content: "", files: [], flags: 64 }).then(msg => {
                })
            } else {
                let desc = dbp.get(`painel_button.msg`);
                const button = new ButtonBuilder()
                    .setStyle(dbp.get(`painel_button.button.style`))
                    .setCustomId(`teste`)
                    .setLabel(`${dbp.get(`painel_button.button.text`)}`)
                if (dbp.get(`painel_button.button.emoji`)) {
                    button.setEmoji(dbp.get(`painel_button.button.emoji`))
                }
                const row = new ActionRowBuilder()
                    .addComponents(button)
                const options = { embeds: [], components: [row], content: desc, files: [], flags: 64 }
                interaction.reply(options).then(msg => {
                })
            }
        }
        if (aa === "config_perso_button_editarmsg") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_perso_button_editarmsg")
                .setTitle("Editando Modelo Mensagem")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Título Padrão")
                .setPlaceholder("Escreva aqui o seu título.")
                .setValue(dbp.get(`painel_button.titulo`) || "")
                .setStyle(1)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("Descrição Padrão")
                .setPlaceholder("Escreva aqui a sua mensagem.")
                .setValue(dbp.get(`painel_button.msg`) || "")
                .setStyle(2)
            if (dbp.get(`modo`) === "embed") {
                modal.addComponents(new ActionRowBuilder().addComponents(text1))
            }
            modal.addComponents(new ActionRowBuilder().addComponents(text2))

            return interaction.showModal(modal)
        }
        if (aa === "config_perso_button_editarbutton") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_perso_button_editarbutton")
                .setTitle("Editando Modelos Botões")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Texto")
                .setPlaceholder("Escreva aqui o texto do botão.")
                .setValue(dbp.get(`painel_button.button.text`) || "")
                .setStyle(1)
                .setRequired(true)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("Emoji")
                .setPlaceholder("Escreva aqui o emoji do botão.")
                .setValue(dbp.get(`painel_button.button.emoji`) || "")
                .setStyle(1)
                .setRequired(false)

            const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setLabel("Cor")
                .setPlaceholder("Cores: Azul, verde, cinza e vermelho.")
                .setStyle(1)
                .setRequired(true)
            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            modal.addComponents(new ActionRowBuilder().addComponents(text3))

            return interaction.showModal(modal)
        }
        if (aa === "config_perso_select_atualizar") {
            let paneis = await db.all()

            const msgg = await interaction.reply({ content: `${dbe.get(`16`)} | Aguarde!`, flags: 64 }).then(async (msgg) => {
                for (const x of paneis) {
                    const channel = interaction.guild.channels.cache.get(x.data.idchannel)
                    if (channel) {
                        channel.messages.fetch(x.data.idmsg).then(async (msg) => {
                            if (x.data.produtos.length > 1) {
                                if (dbp.get(`modo`) === "embed") {

                                    const dataa = x.data.button || {}

                                    const embed = new EmbedBuilder()
                                        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                                        .setTimestamp()
                                    let titulo = dbp.get(`painel_select.titulo`);
                                    titulo = titulo.replace("{nome}", x.data.titulo)
                                    let desc = dbp.get(`painel_select.msg`);
                                    desc = desc.replace("{nome}", x.data.titulo)
                                    desc = desc.replace("{desc}", x.data.desc)
                                    embed.setTitle(titulo)
                                    embed.setDescription(desc)
                                    embed.setColor(dataa.color || dbc.get(`color`))
                                    if (x.data.banner) {
                                        embed.setImage(x.data.banner)
                                    }
                                    if (x.data.thumb) {
                                        embed.setThumbnail(x.data.thumb)
                                    }

                                    const actionrowselect = new StringSelectMenuBuilder()
                                        .setCustomId(x.data.id)
                                        .setPlaceholder(dbp.get(`painel_select.select.place`))

                                    for (const c of x.data.produtos) {
                                        let titulo = dbp.get(`painel_select.select.text`);
                                        titulo = titulo.replace("{nome}", c.nome)
                                        titulo = titulo.replace("{valor}", Number(c.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                        titulo = titulo.replace("{estoque}", c.estoque.length)
                                        let desc = dbp.get(`painel_select.select.desc`);
                                        desc = desc.replace("{nome}", c.nome)
                                        desc = desc.replace("{desc}", c.desc)
                                        desc = desc.replace("{valor}", Number(c.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                        desc = desc.replace("{estoque}", c.estoque.length)
                                        actionrowselect.addOptions(
                                            {
                                                label: `${titulo}`,
                                                description: `${desc}`,
                                                value: `${c.nome}`
                                            }
                                        )
                                    }
                                    const row = new ActionRowBuilder()
                                        .addComponents(actionrowselect)

                                    msg.edit({ embeds: [embed], components: [row], content: "", files: [] }).then(msg => {
                                        db.set(`${x.data.id}.idmsg`, `${msg.id}`)
                                        db.set(`${x.data.id}.idchannel`, `${msg.channel.id}`)
                                    })
                                } else {
                                    let desc = dbp.get(`painel_select.msg`);
                                    desc = desc.replace("{nome}", x.data.titulo)
                                    desc = desc.replace("{desc}", x.data.desc)
                                    const actionrowselect = new StringSelectMenuBuilder()
                                        .setCustomId(x.data.id)
                                        .setPlaceholder(dbp.get(`painel_select.select.place`))

                                    for (const c of x.data.produtos) {
                                        let titulo = dbp.get(`painel_select.select.text`);
                                        titulo = titulo.replace("{nome}", c.nome)
                                        titulo = titulo.replace("{valor}", Number(c.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                        titulo = titulo.replace("{estoque}", c.estoque.length)
                                        let desc = dbp.get(`painel_select.select.desc`);
                                        desc = desc.replace("{nome}", c.nome)
                                        desc = desc.replace("{desc}", c.desc)
                                        desc = desc.replace("{valor}", Number(c.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                        desc = desc.replace("{estoque}", c.estoque.length)
                                        actionrowselect.addOptions(
                                            {
                                                label: `${titulo}`,
                                                description: `${desc}`,
                                                value: `${c.nome}`
                                            }
                                        )
                                    }
                                    const row = new ActionRowBuilder()
                                        .addComponents(actionrowselect)
                                    const options = { embeds: [], components: [row], content: desc, files: [] }
                                    let banner;
                                    if (x.data.banner) {
                                        banner = x.data.banner
                                        options.files = [banner]
                                    }
                                    msg.edit(options).then(msg => {
                                        db.set(`${x.data.id}.idmsg`, `${msg.id}`)
                                        db.set(`${x.data.id}.idchannel`, `${msg.channel.id}`)
                                    })
                                }
                            }
                        }).catch(err => {
                        })
                    }
                }
                await msgg.edit({ content: `${dbe.get(`6`)} | Painéis atualizados!`, flags: 64 })
            })
        }
        if (aa === "config_perso_button_atualizar") {
            let paneis = await db.all()

            const msgg = await interaction.reply({ content: `${dbe.get(`16`)} | Aguarde!`, flags: 64 }).then(async (msgg) => {
                for (const x of paneis) {
                    const channel = interaction.guild.channels.cache.get(x.data.idchannel)
                    if (channel) {
                        updateEspecifico(interaction, x.data)
                    }
                }
                await msgg.edit({ content: `${dbe.get(`6`)} | Painéis atualizados!`, flags: 64 })
            })
        }
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId;
            if (customId === "modal_config_perso_select_editarselect") {
                const place = interaction.fields.getTextInputValue("text1")
                const texto = interaction.fields.getTextInputValue("text2")
                const desc = interaction.fields.getTextInputValue("text3")
                dbp.set(`painel_select.select.text`, texto)
                dbp.set(`painel_select.select.desc`, desc)
                dbp.set(`painel_select.select.place`, place)
                interaction.reply({ content: `${dbe.get(`6`)} | Informações alteradas!`, flags: 64 })
            }
            if (customId === "modal_config_perso_button_editarbutton") {
                const texto = interaction.fields.getTextInputValue("text1")
                const emoji = interaction.fields.getTextInputValue("text2")
                const style = interaction.fields.getTextInputValue("text3").toLowerCase()

                if (texto) {
                    dbp.set(`painel_button.button.text`, texto)
                }
                if (emoji) {
                    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

                    if (emojiRegex.test(emoji) || emoji.startsWith("<")) {
                        dbp.set(`painel_button.button.emoji`, emoji)
                    } else {
                        interaction.reply({ content: `${dbe.get(`13`)} | Emoji inválido!`, flags: 64 })
                        return;
                    }
                } else {
                    dbp.delete(`painel_button.button.emoji`)
                }
                if (style && style === "azul" || style === "verde" || style === "cinza" || style === "vermelho") {
                    let stylee;
                    if (style === "azul") stylee = 1
                    if (style === "cinza") stylee = 2
                    if (style === "verde") stylee = 3
                    if (style === "vermelho") stylee = 4
                    dbp.set(`painel_button.button.style`, stylee)
                } else {
                    interaction.reply({ content: `${dbe.get(`13`)} | Cor inválida!`, flags: 64 })
                    return;
                }
                interaction.reply({ content: `${dbe.get(`6`)} | Informações alteradas!`, flags: 64 })
            }
            if (customId === "modal_config_perso_button_editarmsg") {
                const text2 = interaction.fields.getTextInputValue("text2")
                if (dbp.get(`modo`) === "embed") {
                    const text = interaction.fields.getTextInputValue("text1")
                    dbp.set(`painel_button.titulo`, text)
                }
                if (text2) {
                    dbp.set(`painel_button.msg`, text2)
                }

                interaction.reply({ content: `${dbe.get(`6`)} | Informações alteradas!`, flags: 64 })
            }
            if (customId === "modal_config_perso_select_editarmsg") {
                const text2 = interaction.fields.getTextInputValue("text2")
                if (dbp.get(`modo`) === "embed") {
                    const text = interaction.fields.getTextInputValue("text1")
                    dbp.set(`painel_select.titulo`, text)
                }
                if (text2) {
                    dbp.set(`painel_select.msg`, text2)
                }

                interaction.reply({ content: `${dbe.get(`6`)} | Informações alteradas!`, flags: 64 })
            }
        }
        if (interaction.customId === "config_produtos") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Crie ou remova algum painel.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
            const produtos = db.all()
            const actionrowselect = new StringSelectMenuBuilder()
                .setCustomId('select_painel')
                .setPlaceholder(`Selecione um painel para configurar! (Total ${produtos.length})`)
            let emjmais = dbep.get(`20`)
            let emjmenos = dbep.get(`21`)
            let emjcai = dbep.get(`35`)
            let emjvol = dbep.get(`29`)
            let emjlap = dbep.get(`15`)
            if (db.all().length <= 0) {
                await actionrowselect.addOptions(
                    {
                        label: "Nenhum produto criado :(",
                        value: `nenhum_produto`
                    }
                )
            } else {
                const a = await produtos.slice(Number(0), Number(15));
                await a.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Titulo: ${entry.data.titulo}`,
                            description: `ID: ${entry.data.id}`,
                            emoji: emjcai,
                            value: `${entry.data.id}`
                        }
                    )
                })
            }
            dbc.set(`nmr1`, Number(0))
            dbc.set(`nmr2`, Number(15))

            let emjset1 = dbep.get(`27`)
            let emjset2 = dbep.get(`28`)
            const selectMenu = new ActionRowBuilder()
                .addComponents(actionrowselect)
            const rowpass = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_vol`)
                        .setDisabled(dbc.get(`nmr1`) <= 0 ? true : false)
                        .setEmoji(emjset2),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_pesquisar`)
                        .setDisabled(db.all().length <= 0 ? true : false)
                        .setLabel(`Pesquisar Painel`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_ir`)
                        .setDisabled(dbc.get(`nmr2`) <= 10 ? true : false || dbc.get(`nmr2`) >= db.all().length ? true : false)
                        .setEmoji(emjset1),
                )
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_novopd`)
                        .setLabel(`Criar Painel`)
                        .setEmoji(emjmais),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_removepd`)
                        .setLabel("Remover Painel")
                        .setEmoji(emjmenos),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            interaction.update({ embeds: [embed], components: [selectMenu, rowpass, row], content: "", flags: 64 })
        }
        if (interaction.customId === "config_produtos_ir") {
            const produtos = db.all()
            const actionrowselect = new StringSelectMenuBuilder()
                .setCustomId('select_painel')
                .setPlaceholder(`Selecione um painel para configurar! (Total ${produtos.length})`)
            let emjmais = dbep.get(`20`)
            let emjmenos = dbep.get(`21`)
            let emjcai = dbep.get(`35`)
            let emjvol = dbep.get(`29`)
            let emjlap = dbep.get(`15`)
            dbc.add(`nmr1`, 15)
            dbc.add(`nmr2`, 15)
            if (db.all().length <= 0) {
                await actionrowselect.addOptions(
                    {
                        label: "Nenhum produto criado :(",
                        value: `nenhum_produto`
                    }
                )
            } else {
                const a = await produtos.slice(Number(dbc.get(`nmr1`)), Number(dbc.get(`nmr2`)));
                await a.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Titulo: ${entry.data.titulo}`,
                            description: `ID: ${entry.data.id}`,
                            emoji: emjcai,
                            value: `${entry.data.id}`
                        }
                    )
                })
            }

            let emjset1 = dbep.get(`27`)
            let emjset2 = dbep.get(`28`)
            const selectMenu = new ActionRowBuilder()
                .addComponents(actionrowselect)
            const rowpass = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_vol`)
                        .setDisabled(dbc.get(`nmr1`) <= 0 ? true : false)
                        .setEmoji(emjset2),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_pesquisar`)
                        .setDisabled(db.all().length <= 0 ? true : false)
                        .setLabel(`Pesquisar Painel`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_ir`)
                        .setDisabled(dbc.get(`nmr2`) <= 10 ? true : false || dbc.get(`nmr2`) >= db.all().length ? true : false)
                        .setEmoji(emjset1),
                )
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_novopd`)
                        .setLabel(`Criar Painel`)
                        .setEmoji(emjmais),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_removepd`)
                        .setLabel("Remover Painel")
                        .setEmoji(emjmenos),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            interaction.update({ components: [selectMenu, rowpass, row], content: "", flags: 64 })
        }
        if (interaction.customId === "config_produtos_vol") {
            const produtos = db.all()
            const actionrowselect = new StringSelectMenuBuilder()
                .setCustomId('select_painel')
                .setPlaceholder(`Selecione um painel para configurar! (Total ${produtos.length})`)
            let emjmais = dbep.get(`20`)
            let emjmenos = dbep.get(`21`)
            let emjcai = dbep.get(`35`)
            let emjvol = dbep.get(`29`)
            let emjlap = dbep.get(`15`)
            dbc.substr(`nmr1`, 15)
            dbc.substr(`nmr2`, 15)
            if (db.all().length <= 0) {
                await actionrowselect.addOptions(
                    {
                        label: "Nenhum produto criado :(",
                        value: `nenhum_produto`
                    }
                )
            } else {
                const a = await produtos.slice(Number(dbc.get(`nmr1`)), Number(dbc.get(`nmr2`)));
                await a.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Titulo: ${entry.data.titulo}`,
                            description: `ID: ${entry.data.id}`,
                            emoji: emjcai,
                            value: `${entry.data.id}`
                        }
                    )
                })
            }

            let emjset1 = dbep.get(`27`)
            let emjset2 = dbep.get(`28`)
            const selectMenu = new ActionRowBuilder()
                .addComponents(actionrowselect)
            const rowpass = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_vol`)
                        .setDisabled(dbc.get(`nmr1`) <= 0 ? true : false)
                        .setEmoji(emjset2),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_pesquisar`)
                        .setDisabled(db.all().length <= 0 ? true : false)
                        .setLabel(`Pesquisar Painel`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_ir`)
                        .setDisabled(dbc.get(`nmr2`) <= 10 ? true : false || dbc.get(`nmr2`) >= db.all().length ? true : false)
                        .setEmoji(emjset1),
                )
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_novopd`)
                        .setLabel(`Criar Painel`)
                        .setEmoji(emjmais),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_removepd`)
                        .setLabel("Remover Painel")
                        .setEmoji(emjmenos),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            interaction.update({ components: [selectMenu, rowpass, row], content: "", flags: 64 })
        }
        if (interaction.customId === "config_produtos_pesquisar") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_produtos_pesquisar")
                .setTitle("Pesquisando Produto")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Qual será o ID?")
                .setPlaceholder("Digite aqui o id do produto ✏")
                .setStyle(1)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))

            return interaction.showModal(modal)
        }
        if (interaction.customId === "config_produtos_removepd") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_produtos_removepd")
                .setTitle("Removendo Painel")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Qual é o ID do painel?")
                .setPlaceholder("Aviso. O painel terá todo os seus produtos removidos!")
                .setStyle(1)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))

            return interaction.showModal(modal)
        }
        if (interaction.customId === "config_produtos_novopd") {
            const modal = new ModalBuilder()
                .setCustomId("modal_config_produtos_novopd")
                .setTitle("Criando Painel")

            const text1 = new TextInputBuilder()
                .setCustomId("text1")
                .setLabel("Qual é o ID do painel?")
                .setStyle(1)

            const text2 = new TextInputBuilder()
                .setCustomId("text2")
                .setLabel("Qual é o Título do painel?")
                .setStyle(1)

            const text3 = new TextInputBuilder()
                .setCustomId("text3")
                .setLabel("Qual é a Descrição do painel?")
                .setStyle(2)

            const text4 = new TextInputBuilder()
                .setCustomId("text4")
                .setLabel("Qual é o Banner do painel?")
                .setPlaceholder("Não é obrigatório!")
                .setStyle(1)
                .setRequired(false)

            const text5 = new TextInputBuilder()
                .setCustomId("text5")
                .setLabel("Qual é a Thumbnail do painel?")
                .setPlaceholder("Não é obrigatório!")
                .setStyle(1)
                .setRequired(false)

            modal.addComponents(new ActionRowBuilder().addComponents(text1))
            modal.addComponents(new ActionRowBuilder().addComponents(text2))
            modal.addComponents(new ActionRowBuilder().addComponents(text3))
            modal.addComponents(new ActionRowBuilder().addComponents(text5))
            modal.addComponents(new ActionRowBuilder().addComponents(text4))

            return interaction.showModal(modal)
        }
        if (interaction.isModalSubmit() && interaction.customId === "modal_config_produtos_pesquisar") {
            const id = interaction.fields.getTextInputValue("text1");

            if (!db.has(id)) {
                interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                return;
            }
            const pd = await db.get(`${id}`)
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Configure e personalize o painel **${pd.id}**`)
                .addFields(
                    {
                        name: `ID:`,
                        value: `${pd.id}`,
                        inline: true
                    },
                    {
                        name: `Produtos:`,
                        value: `${pd.produtos.length} Produtos.`,
                        inline: true
                    },
                    {
                        name: `Título:`,
                        value: `${pd.titulo}`,
                        inline: true
                    },
                    {
                        name: `Descrição:`,
                        value: `${pd.desc}`,
                        inline: true
                    },
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
            let emjcai = dbep.get(`35`)
            let emjlap = dbep.get(`1`)
            let emjcup = dbep.get(`14`)
            let emjenv = dbep.get(`13`)
            let emjexc = dbep.get(`23`)
            let emjatt = dbep.get(`6`)
            let emjvol = dbep.get(`29`)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_este`)
                        .setLabel(`Editar`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_pd`)
                        .setLabel(`Gerenciar Produtos`)
                        .setEmoji(emjcai),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_cupom`)
                        .setLabel(`Gerenciar Cupons`)
                        .setEmoji(emjcup),
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(3)
                        .setCustomId(`${pd.id}_configpd_enviar`)
                        .setLabel(`Enviar Painel`)
                        .setEmoji(emjenv),
                    new ButtonBuilder()
                        .setCustomId(`${pd.id}_configpd_excluir`)
                        .setStyle(4)
                        .setLabel(`Excluir`)
                        .setEmoji(emjexc)
                )
            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`${pd.id}_configpd_atualizar`)
                        .setLabel(`Atualizar Painel`)
                        .setEmoji(emjatt),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos`)
                        .setLabel(`Voltar`)
                        .setEmoji(emjvol)
                )

            interaction.update({ embeds: [embed], components: [row, row2, row3] })
        }
        if (interaction.isModalSubmit() && interaction.customId === "modal_config_produtos_removepd") {
            const id = interaction.fields.getTextInputValue("text1");

            if (db.has(`${id}`)) {
                await db.delete(id)
                const produtos = db.all()
                const actionrowselect = new StringSelectMenuBuilder()
                    .setCustomId('select_painel')
                    .setPlaceholder(`Selecione um painel para configurar! (Total ${produtos.length})`)
                let emjcai = dbep.get(`35`)

                if (db.all().length <= 0) {
                    await actionrowselect.addOptions(
                        {
                            label: "Nenhum produto criado :(",
                            value: `nenhum_produto`
                        }
                    )
                } else {
                    const a = await produtos.slice(Number(dbc.get(`nmr1`)), Number(dbc.get(`nmr2`)));
                    await a.map(async (entry) => {
                        actionrowselect.addOptions(
                            {
                                label: `Titulo: ${entry.data.titulo}`,
                                description: `ID: ${entry.data.id}`,
                                emoji: emjcai,
                                value: `${entry.data.id}`
                            }
                        )
                    })
                }

                let emjmais = dbep.get(`20`)
                let emjmenos = dbep.get(`21`)
                let emjvol = dbep.get(`29`)
                let emjlap = dbep.get(`15`)
                let emjset1 = dbep.get(`27`)
                let emjset2 = dbep.get(`28`)
                const selectMenu = new ActionRowBuilder()
                    .addComponents(actionrowselect)
                const rowpass = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`config_produtos_vol`)
                            .setDisabled(dbc.get(`nmr1`) <= 0 ? true : false)
                            .setEmoji(emjset2),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`config_produtos_pesquisar`)
                            .setDisabled(db.all().length <= 0 ? true : false)
                            .setLabel(`Pesquisar Painel`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`config_produtos_ir`)
                            .setDisabled(dbc.get(`nmr2`) <= 10 ? true : false || dbc.get(`nmr2`) >= db.all().length ? true : false)
                            .setEmoji(emjset1),
                    )
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`config_produtos_novopd`)
                            .setLabel(`Criar Painel`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`config_produtos_removepd`)
                            .setLabel("Remover Painel")
                            .setEmoji(emjmenos),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`config_produtos_voltar`)
                            .setLabel("Voltar")
                            .setEmoji(emjvol),
                    )
                await interaction.update({ components: [selectMenu, rowpass, row], content: "", flags: 64 }).then(() => {
                    interaction.followUp({ content: `${dbe.get(`6`)} | Produto Apagado!`, flags: 64 })
                })
            } else {
                interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                return;
            }
        }
        if (interaction.isModalSubmit() && interaction.customId === "modal_config_produtos_novopd") {
            const id = interaction.fields.getTextInputValue("text1");
            const titulo = interaction.fields.getTextInputValue("text2");
            const desc = interaction.fields.getTextInputValue("text3");
            const banner = interaction.fields.getTextInputValue("text4");
            const thumb = interaction.fields.getTextInputValue("text5");

            if (db.has(id)) {
                interaction.reply({ content: `${dbe.get(`13`)} | Ja existe um produto com esse ID! `, flags: 64 })
                return;
            }

            if (banner && !banner.startsWith("https://")) {
                interaction.reply({ content: `${dbe.get(`13`)} | Link do Banner Inválido!`, flags: 64 })
                return;
            }
            if (thumb && !thumb.startsWith("https://")) {
                interaction.reply({ content: `${dbe.get(`13`)} | Link do Thumbnail Inválido!`, flags: 64 })
                return;
            }

            const msg = await interaction.update({ content: `${dbe.get(`16`)} | Aguarde...`, flags: 64 })

            await db.set(`${id}.id`, id)
            await db.set(`${id}.titulo`, titulo)
            await db.set(`${id}.desc`, desc)
            await db.set(`${id}.produtos`, [])
            if (banner) {
                await db.set(`${id}.banner`, banner)
            }
            if (thumb) {
                await db.set(`${id}.thumb`, thumb)
            }
            const produtos = db.all()
            const actionrowselect = new StringSelectMenuBuilder()
                .setCustomId('select_painel')
                .setPlaceholder(`Selecione um painel para configurar! (Total ${produtos.length})`)
            let emjcai = dbep.get(`35`)

            if (db.all().length <= 0) {
                await actionrowselect.addOptions(
                    {
                        label: "Nenhum produto criado :(",
                        value: `nenhum_produto`
                    }
                )
            } else {
                const a = await produtos.slice(Number(dbc.get(`nmr1`)), Number(dbc.get(`nmr2`)));
                await a.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Titulo: ${entry.data.titulo}`,
                            description: `ID: ${entry.data.id}`,
                            emoji: emjcai,
                            value: `${entry.data.id}`
                        }
                    )
                })
            }

            let emjmais = dbep.get(`20`)
            let emjmenos = dbep.get(`21`)
            let emjvol = dbep.get(`29`)
            let emjlap = dbep.get(`15`)
            let emjset1 = dbep.get(`27`)
            let emjset2 = dbep.get(`28`)
            const selectMenu = new ActionRowBuilder()
                .addComponents(actionrowselect)
            const rowpass = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_vol`)
                        .setDisabled(dbc.get(`nmr1`) <= 0 ? true : false)
                        .setEmoji(emjset2),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_pesquisar`)
                        .setDisabled(db.all().length <= 0 ? true : false)
                        .setLabel(`Pesquisar Painel`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_ir`)
                        .setDisabled(dbc.get(`nmr2`) <= 10 ? true : false || dbc.get(`nmr2`) >= db.all().length ? true : false)
                        .setEmoji(emjset1),
                )
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_novopd`)
                        .setLabel(`Criar Painel`)
                        .setEmoji(emjmais),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_produtos_removepd`)
                        .setLabel("Remover Painel")
                        .setEmoji(emjmenos),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol),
                )
            msg.edit({ components: [selectMenu, rowpass, row], content: "", flags: 64 })
            interaction.followUp({ content: `${dbe.get(`6`)} | Produto criado.`, flags: 64 })
        }
        if (interaction.isStringSelectMenu() && interaction.customId === "select_painel") {
            const id = interaction.values[0];

            if (!db.has(id)) {
                interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                return;
            }
            const pd = await db.get(`${id}`)
            const embed = new EmbedBuilder()
                .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Configure e personalize o painel **${pd.id}**`)
                .addFields(
                    {
                        name: `ID:`,
                        value: `${pd.id}`,
                        inline: true
                    },
                    {
                        name: `Produtos:`,
                        value: `${pd.produtos.length} Produtos.`,
                        inline: true
                    },
                    {
                        name: `Título:`,
                        value: `${pd.titulo}`,
                        inline: true
                    },
                    {
                        name: `Descrição:`,
                        value: `${pd.desc}`,
                        inline: true
                    },
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
            let emjcai = dbep.get(`35`)
            let emjlap = dbep.get(`1`)
            let emjcup = dbep.get(`14`)
            let emjenv = dbep.get(`13`)
            let emjexc = dbep.get(`23`)
            let emjatt = dbep.get(`6`)
            let emjvol = dbep.get(`29`)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_este`)
                        .setLabel(`Editar`)
                        .setEmoji(emjlap),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_pd`)
                        .setLabel(`Gerenciar Produtos`)
                        .setEmoji(emjcai),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`${pd.id}_configpd_cupom`)
                        .setLabel(`Gerenciar Cupons`)
                        .setEmoji(emjcup),
                )
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(3)
                        .setCustomId(`${pd.id}_configpd_enviar`)
                        .setLabel(`Enviar Painel`)
                        .setEmoji(emjenv),
                    new ButtonBuilder()
                        .setCustomId(`${pd.id}_configpd_excluir`)
                        .setStyle(4)
                        .setLabel(`Excluir`)
                        .setEmoji(emjexc)
                )
            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`${pd.id}_configpd_atualizar`)
                        .setLabel(`Atualizar Painel`)
                        .setEmoji(emjatt),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos`)
                        .setLabel(`Voltar`)
                        .setEmoji(emjvol)
                )

            interaction.update({ embeds: [embed], components: [row, row2, row3] })
        }
        if (interaction.isButton()) {
            const customId = interaction.customId;
            const id = customId.split("_")[0]
            const nome = customId.split("_")[1]

            if (customId.endsWith("_configpd")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure e personalize o painel **${pd.id}**`)
                    .addFields(
                        {
                            name: `ID:`,
                            value: `${pd.id}`,
                            inline: true
                        },
                        {
                            name: `Produtos:`,
                            value: `${pd.produtos.length} Produtos.`,
                            inline: true
                        },
                        {
                            name: `Título:`,
                            value: `${pd.titulo}`,
                            inline: true
                        },
                        {
                            name: `Descrição:`,
                            value: `${pd.desc}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                let emjcai = dbep.get(`35`)
                let emjlap = dbep.get(`1`)
                let emjcup = dbep.get(`14`)
                let emjenv = dbep.get(`13`)
                let emjexc = dbep.get(`23`)
                let emjatt = dbep.get(`6`)
                let emjvol = dbep.get(`29`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${pd.id}_configpd_este`)
                            .setLabel(`Editar`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${pd.id}_configpd_pd`)
                            .setLabel(`Gerenciar Produtos`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${pd.id}_configpd_cupom`)
                            .setLabel(`Gerenciar Cupons`)
                            .setEmoji(emjcup),
                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(3)
                            .setCustomId(`${pd.id}_configpd_enviar`)
                            .setLabel(`Enviar Painel`)
                            .setEmoji(emjenv),
                        new ButtonBuilder()
                            .setCustomId(`${pd.id}_configpd_excluir`)
                            .setStyle(4)
                            .setLabel(`Excluir`)
                            .setEmoji(emjexc)
                    )
                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${pd.id}_configpd_atualizar`)
                            .setLabel(`Atualizar Painel`)
                            .setEmoji(emjatt),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`config_produtos`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )

                interaction.update({ embeds: [embed], components: [row, row2, row3] })
            }
            if (customId.endsWith("_configpd_atualizar")) {
                const x = db.get(`${id}`)
                const channel = interaction.guild.channels.cache.get(x.idchannel)
                if (channel) {
                    if (x.produtos.length <= 0) return interaction.reply({ content: `${dbe.get(`13`)} | Crie um produto no painel!`, flags: 64 })
                    updateEspecifico(interaction, x).then(() => {
                        interaction.reply({ content: `${dbe.get(`6`)} | Mensagem atualizada.`, flags: 64 })
                    }).catch(() => {
                        interaction.reply({ content: `${dbe.get(`13`)} | Mensagem não atualizada.`, flags: 64 })
                    })
                } else {
                    interaction.reply({ content: `${dbe.get(`13`)} | Canal não encontrado.`, flags: 64 })
                }
            }
            if (customId.endsWith("_configpd_excluir")) {
                const modal = new ModalBuilder()
                    .setTitle(`Confirmação Excluir`)
                    .setCustomId(`${id}_modal_configpd_excluir`)
                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Confirmação")
                    .setPlaceholder("Escreva SIM.")
                    .setStyle(1)
                    .setRequired(true)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_enviar")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                const select = new ActionRowBuilder()
                    .addComponents(
                        new Discord.ChannelSelectMenuBuilder()
                            .setChannelTypes(Discord.ChannelType.GuildText)
                            .setCustomId(`${pd.id}_channel_configpd_enviar`)
                            .setMaxValues(1)
                            .setPlaceholder(`Selecione o canal que o painel ficará.`),
                    )
                interaction.reply({ embeds: [], components: [select], flags: 64 })
            }
            if (customId.endsWith("_configpd_cupom")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                let cuponss = ""
                const a = pd.cupons || []
                await a.map((entry, index) => { cuponss += `- **Nome:** \`${entry.nome}\`. **Desconto:** \`${entry.porcentagem}%\`. **Valor Máximo:** \`${entry.valormax ? `R$${Number(entry.valormax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Valor Mínimo:** \`${entry.valormin ? `R$${Number(entry.valormin).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Cargo:** ${entry.cargo ? `<@&${entry.cargo}>` : `Não Definido`} \n`; });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Crie, configure ou remova cupons do painel **${pd.id}**!`)
                    .addFields(
                        {
                            name: `Cupons Atuais:`,
                            value: `${cuponss || "Nenhum cupom criado!"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                let emjlap = dbep.get(`1`)
                let emjcup = dbep.get(`14`)
                let emjmenos = dbep.get(`21`)
                let emjexc = dbep.get(`23`)
                let emjvol = dbep.get(`29`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${pd.id}_configpd_cupom_criar`)
                            .setLabel(`Criar Cupom`)
                            .setEmoji(emjcup),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${pd.id}_configpd_cupom_editar`)
                            .setLabel(`Editar Cupom`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId(`${pd.id}_configpd_cupom_remover`)
                            .setLabel(`Remover Cupom`)
                            .setEmoji(emjmenos),
                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${pd.id}_configpd_cupom_limpar`)
                            .setStyle(4)
                            .setLabel(`Limpar Cupons`)
                            .setEmoji(emjexc),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${pd.id}_configpd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )

                interaction.update({ embeds: [embed], components: [row, row2] })
            }
            if (customId.endsWith("_configpd_cupom_limpar")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_cupom_limpar`)
                    .setTitle("Limpar Cupons")

                const text = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Confirmação")
                    .setPlaceholder("Escreva SIM para APAGAR TODOS os cupons.")
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text))
                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_cupom_remover")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_cupom_remover`)
                    .setTitle("Remover Cupom")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome:")
                    .setPlaceholder("Informe o nome do cupom.")
                    .setStyle(1)
                    .setMaxLength(25)

                const text2 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("Confirmação:")
                    .setPlaceholder("Escreva SIM para apagar o cupom desejado.")
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_cupom_editar")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_cupom_editar`)
                    .setTitle("Editando Cupom")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome:")
                    .setPlaceholder("Informe o nome do cupom.")
                    .setStyle(1)
                    .setMaxLength(25)

                const text2 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("ID Cargo:")
                    .setPlaceholder("Informe ID do cargo que poderá usar o cupom.")
                    .setStyle(1)
                    .setRequired(false)
                    .setMaxLength(25)

                const text3 = new TextInputBuilder()
                    .setCustomId("text3")
                    .setLabel("Porcentagem:")
                    .setPlaceholder("Informe a porcentagem de desconto do cupom.")
                    .setStyle(1)

                const text4 = new TextInputBuilder()
                    .setCustomId("text4")
                    .setLabel("Valor Máximo:")
                    .setPlaceholder("Informe o valor máximo para usar o cupom.")
                    .setRequired(false)
                    .setStyle(1)

                const text5 = new TextInputBuilder()
                    .setCustomId("text5")
                    .setLabel("Valor Mínimo:")
                    .setPlaceholder("Informe o valor mínimo para usar o cupom.")
                    .setRequired(false)
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                modal.addComponents(new ActionRowBuilder().addComponents(text3))
                modal.addComponents(new ActionRowBuilder().addComponents(text4))
                modal.addComponents(new ActionRowBuilder().addComponents(text5))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_cupom_criar")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_cupom_criar`)
                    .setTitle("Criando Cupom")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome:")
                    .setPlaceholder("Informe o nome do cupom.")
                    .setStyle(1)
                    .setMaxLength(25)

                const text2 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("ID Cargo:")
                    .setPlaceholder("Informe ID do cargo que poderá usar o cupom.")
                    .setStyle(1)
                    .setRequired(false)
                    .setMaxLength(25)

                const text3 = new TextInputBuilder()
                    .setCustomId("text3")
                    .setLabel("Porcentagem:")
                    .setPlaceholder("Informe a porcentagem de desconto do cupom.")
                    .setStyle(1)

                const text4 = new TextInputBuilder()
                    .setCustomId("text4")
                    .setLabel("Valor Máximo:")
                    .setPlaceholder("Informe o valor máximo para usar o cupom.")
                    .setRequired(false)
                    .setStyle(1)

                const text5 = new TextInputBuilder()
                    .setCustomId("text5")
                    .setLabel("Valor Mínimo:")
                    .setPlaceholder("Informe o valor mínimo para usar o cupom.")
                    .setRequired(false)
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                modal.addComponents(new ActionRowBuilder().addComponents(text3))
                modal.addComponents(new ActionRowBuilder().addComponents(text4))
                modal.addComponents(new ActionRowBuilder().addComponents(text5))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                let produto = ""

                await pd.produtos.slice(0, 10).map((entry, index) => {
                    produto += `> **Nome:** \`${entry.nome}\`. **Estoque:** \`${entry.estoque.length}\`. **Valor:** \`R$${Number(entry.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`\n`;
                });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure e personalize o painel **${pd.id}**`)
                    .addFields(
                        {
                            name: `Detalhes dos Produtos:`,
                            value: `${produto || "Nenhum Produto Criado."}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                const actionrowselect = new StringSelectMenuBuilder()
                    .setCustomId('select_produtos')
                    .setPlaceholder(`Selecione um produto! (Total ${pd.produtos.length})`)

                let emjcai = dbep.get(`35`)

                if (pd.produtos.length <= 0) {
                    actionrowselect.addOptions(
                        {
                            label: `Não tem produtos, crie um!`,
                            value: `nenhum_produto`
                        }
                    )
                }
                await pd.produtos.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Nome: ${entry.nome}`,
                            description: `Valor: R$${Number(entry.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Estoque: ${entry.estoque.length}`,
                            emoji: emjcai,
                            value: `${id}_${entry.nome}`
                        }
                    )
                })

                const select = new ActionRowBuilder()
                    .addComponents(actionrowselect)
                let emjvol = dbep.get(`29`)
                let emjmais = dbep.get(`20`)
                let emjmenos = dbep.get(`21`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_add`)
                            .setLabel(`Adicionar Produto`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_sub`)
                            .setLabel(`Remover Produto`)
                            .setEmoji(emjmenos),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_configpd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )
                interaction.update({ embeds: [embed], components: [select, row] })
            }
            if (customId.endsWith("_configpd_pd_add")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_pd_add`)
                    .setTitle("Criando Produto")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome")
                    .setPlaceholder("Informe o nome do produto.")
                    .setStyle(1)
                    .setMaxLength(50)

                const text2 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("Emoji")
                    .setPlaceholder("Coloque aqui o emoji representará o produto.")
                    .setStyle(1)
                    .setRequired(false)

                const text3 = new TextInputBuilder()
                    .setCustomId("text3")
                    .setLabel("Preço")
                    .setPlaceholder("Informe o preço do produto.")
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                modal.addComponents(new ActionRowBuilder().addComponents(text3))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_sub")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_pd_sub`)
                    .setTitle("Removendo Produto")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome:")
                    .setPlaceholder("Informe o nome do produto que será removido.")
                    .setStyle(1)
                    .setMaxLength(25)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_este")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_modal_configpd_este`)
                    .setTitle("Editando Painel")

                const text2 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Qual é o Título do painel?")
                    .setStyle(1)
                    .setValue(db.get(`${id}.titulo`))

                const text3 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("Qual é a Descrição do painel?")
                    .setStyle(2)
                    .setValue(db.get(`${id}.desc`))

                const text4 = new TextInputBuilder()
                    .setCustomId("text3")
                    .setLabel("Qual é o Banner do painel?")
                    .setPlaceholder("Não é obrigatório!")
                    .setStyle(1)
                    .setRequired(false)
                    .setValue(db.get(`${id}.banner`) || "")

                const text5 = new TextInputBuilder()
                    .setCustomId("text4")
                    .setLabel("Qual é a Thumbnail do painel?")
                    .setPlaceholder("Não é obrigatório!")
                    .setStyle(1)
                    .setRequired(false)
                    .setValue(db.get(`${id}.thumb`) || "")

                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                modal.addComponents(new ActionRowBuilder().addComponents(text3))
                modal.addComponents(new ActionRowBuilder().addComponents(text5))
                modal.addComponents(new ActionRowBuilder().addComponents(text4))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_editar")) {
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setCustomId(`${id}_${pdd.nome}_modal_configpd_pd_editar`)
                    .setTitle("Editando Produto")

                const text1 = new TextInputBuilder()
                    .setCustomId("text1")
                    .setLabel("Nome")
                    .setPlaceholder("Informe o nome do produto.")
                    .setStyle(1)
                    .setValue(pdd.nome)
                    .setMaxLength(50)

                const text2 = new TextInputBuilder()
                    .setCustomId("text2")
                    .setLabel("Emoji")
                    .setPlaceholder("Coloque aqui o emoji representará o produto.")
                    .setStyle(1)
                    .setRequired(false)
                    .setValue(pdd.emoji || "")

                const text3 = new TextInputBuilder()
                    .setCustomId("text3")
                    .setLabel("Preço")
                    .setValue(pdd.preco)
                    .setPlaceholder("Informe o preço do produto.")
                    .setStyle(1)

                modal.addComponents(new ActionRowBuilder().addComponents(text1))
                modal.addComponents(new ActionRowBuilder().addComponents(text2))
                modal.addComponents(new ActionRowBuilder().addComponents(text3))

                return interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_voltar")) {
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure o produto **${nome}**.`)
                    .addFields(
                        {
                            name: `Nome:`,
                            value: `${pdd.nome}`,
                            inline: true
                        },
                        {
                            name: `Emoji:`,
                            value: `${pdd.emoji || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Preço:`,
                            value: `R$${Number(pdd.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjcai = dbep.get(`35`)
                let emjlap = dbep.get(`1`)
                let emjesc = dbep.get(`22`)
                let emjlup = dbep.get(`15`)
                let emjcli = dbep.get(`31`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_editar`)
                            .setLabel(`Editar`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_cargos`)
                            .setLabel(`Gerenciar Cargos`)
                            .setEmoji(emjcli),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_definicao`)
                            .setLabel(`Definir Condições`)
                            .setEmoji(emjesc),
                    )

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_verestoque`)
                            .setLabel(`Ver Estoque`)
                            .setEmoji(emjlup),
                        new ButtonBuilder()
                            .setStyle(3)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_addestoque`)
                            .setLabel(`Gerenciar Estoque`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )


                interaction.update({ embeds: [embed], components: [row, row2] })
            }
            if (customId.endsWith("_configpd_pd_cargos")) {
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const cargocliente = interaction.guild.roles.cache.get(pdd.cargocliente)
                const cargocliented = interaction.guild.roles.cache.get(dbc.get(`canais.cargo_cliente`))
                let cargosn = ""
                const a = pdd.cargosLiberados || []
                await a.map((entry, index) => { cargosn += `- ${interaction.guild.roles.cache.get(entry)}\n`; });
                if (a.length <= 0) cargosn = "`🟢 Todos Podem Comprar!`"

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure um cargo cliente alternativo e quem será proibido de comprar o produto.`)
                    .addFields(
                        {
                            name: `Cargo cliente:`,
                            value: `${cargocliente || cargocliented || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Cargos que não podem comprar:`,
                            value: `${cargosn || "Não Definido"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjbol = dbep.get(`3`)
                let emjcai = dbep.get(`35`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cliente`)
                            .setLabel(`Cargo Cliente`)
                            .setEmoji(emjbol),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cargosproi`)
                            .setLabel(`Cargos Proibidos de Comprar`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol),
                    )

                interaction.update({ embeds: [embed], components: [row] })
            }
            if (customId.endsWith("_configpd_pd_cargos_cargosproi")) {
                const select = new ActionRowBuilder()
                    .addComponents(
                        new Discord.RoleSelectMenuBuilder()
                            .setCustomId(`${id}_${nome}_channel_configpd_pd_cargos_cargosproi`)
                            .setMaxValues(20)
                            .setPlaceholder(`Selecione um cargo...`),
                    )
                let emjrei = dbep.get(`6`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos`)
                            .setEmoji(dbep.get(`29`)),
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cargosproi_reset`)
                            .setLabel(`Resetar Cargos`)
                            .setEmoji(emjrei)
                    )
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setColor(dbc.get("color"))
                            .setDescription(`Olá ${interaction.user} 👋.\n- Selecione os cargos que serão permitidos comprar o produto **${nome}**.`)
                    ], components: [select, row]
                })
            }
            if (customId.endsWith("_configpd_pd_cargos_cargosproi_reset")) {
                const cargoman = []
                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                pd.produtos[index].cargosLiberados = cargoman
                db.set(`${id}`, pd)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const cargocliente = interaction.guild.roles.cache.get(pdd.cargocliente)
                const cargocliented = interaction.guild.roles.cache.get(dbc.get(`canais.cargo_cliente`))
                let cargosn = ""
                const a = pdd.cargosLiberados || []
                await a.map((entry, index) => { cargosn += `- ${interaction.guild.roles.cache.get(entry)}\n`; });
                if (a.length <= 0) cargosn = "`🟢 Todos Podem Comprar!`"

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure um cargo cliente alternativo e quem será proibido de comprar o produto.`)
                    .addFields(
                        {
                            name: `Cargo cliente:`,
                            value: `${cargocliente || cargocliented || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Cargos que não podem comprar:`,
                            value: `${cargosn || "Não Definido"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjbol = dbep.get(`3`)
                let emjcai = dbep.get(`35`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cliente`)
                            .setLabel(`Cargo Cliente`)
                            .setEmoji(emjbol),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cargosproi`)
                            .setLabel(`Cargos Proibidos de Comprar`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol),
                    )

                await interaction.update({ embeds: [embed], components: [row] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo liberados para comprar resetados!`, flags: 64 })
            }
            if (customId.endsWith("_configpd_pd_cargos_cliente")) {
                const select = new ActionRowBuilder()
                    .addComponents(
                        new Discord.RoleSelectMenuBuilder()
                            .setCustomId(`${id}_${nome}_channel_configpd_pd_cargos_cliente`)
                            .setMaxValues(1)
                            .setPlaceholder(`Selecione um cargo...`),
                    )
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos`)
                            .setEmoji(dbep.get(`29`))
                    )
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                            .setColor(dbc.get("color"))
                            .setDescription(`Olá ${interaction.user} 👋.\n- Selecione o cargo que será dado após alguém fazer uma compra no seu bot.`)
                    ], components: [select, row]
                })
            }
            if (customId.endsWith(`_configpd_pd_definicao`)) {

                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setTitle(`Configurando Condições`)
                    .setCustomId(`${id}_${nome}_modal_configpd_pd_definicao`)
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text1`)
                                    .setLabel(`Cargo ID`)
                                    .setValue(pdd.condições.cargo || "")
                                    .setRequired(false)
                                    .setPlaceholder(`Informe o cargo que aplicará essas condições.`)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text2`)
                                    .setLabel(`Valor Máximo de Compra`)
                                    .setValue(pdd.condições.valormaximo || "")
                                    .setRequired(false)
                                    .setPlaceholder(`Informe um valor máximo de compra.`)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text3`)
                                    .setLabel(`Valor Mínimo de Compra`)
                                    .setValue(pdd.condições.valorminimo || "")
                                    .setRequired(false)
                                    .setPlaceholder(`Informe um valor mínimo de compra.`)
                            ),
                    )
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_verestoque")) {
                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                if (pd.produtos[index].estoque.length <= 0) {
                    interaction.reply({ content: `${dbe.get(`2`)} | Produto sem estoque!`, flags: 64 })
                    return
                }
                let conteudoEstoque = ""

                await pdd.estoque.map((entry, index) => { conteudoEstoque += `${index + 1}° - ${entry}\n`; });
                const fileName = `estoque_${nome}.txt`;
                const fileBuffer = Buffer.from(conteudoEstoque, 'utf-8');
                let emjcai = dbep.get(`35`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_verestoque_backup`)
                            .setLabel(`Backup (Mandar o estoque na DM)`)
                            .setEmoji("💾"),
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId(`${id}_${nome}_configpd_pd_verestoque_remover`)
                            .setLabel(`Remover Produto do Estoque`)
                            .setEmoji(emjcai)
                    )
                interaction.reply({
                    content: `${dbe.get(`6`)} | Aqui está o seu estoque:`, files: [{
                        attachment: fileBuffer,
                        name: fileName
                    }], components: [row], flags: 64
                })
            }
            if (customId.endsWith("_configpd_pd_verestoque_remover")) {

                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setTitle(`Removendo Estoque`)
                    .setCustomId(`${id}_${nome}_modal_configpd_pd_verestoque_remover`)
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text1`)
                                    .setLabel(`ID`)
                                    .setRequired(true)
                                    .setPlaceholder(`Informe a numeração do produto que você deseja remover.`)
                            ),
                    )
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_verestoque_backup")) {
                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                if (pd.produtos[index].estoque.length <= 0) {
                    interaction.reply({ content: `${dbe.get(`2`)} | Produto sem estoque!`, flags: 64 })
                    return
                }
                let conteudoEstoque = ""

                await pdd.estoque.map((entry, index) => { conteudoEstoque += `${entry}\n`; });
                const fileName = `estoque_${nome}.txt`;
                const fileBuffer = Buffer.from(conteudoEstoque, 'utf-8');
                interaction.user.send({
                    content: `${dbe.get(`6`)} | Backup de estoque do produto ${nome}:`, files: [{
                        attachment: fileBuffer,
                        name: fileName
                    }]
                }).then((msg) => {
                    interaction.reply({ content: `${dbe.get(`6`)} | Backup Enviado!`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(5).setLabel(`Ir Até o Backup`).setURL(msg.url))], flags: 64 })
                }).catch(() => {

                    interaction.reply({ content: `${dbe.get(`13`)} | O backup não foi enviado! Tente deixar o seu privado desbloqueado.`, flags: 64 })
                })
            }
            if (customId.endsWith("_configpd_pd_addestoque")) {
                const pd = db.get(`${id}`)
                db.set(`${id}`, pd)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Adicione ou limpe o estoque do produto **${nome}**. \n- Para remover um produto de forma individual, clique no botão de ver estoque na página principal de configuração do produto, logo após clique no botão remover produto e informe a numeração.`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                let emjvol = dbep.get(`29`)
                let emjmais = dbep.get(`20`)
                let emjfan = dbep.get(`8`)
                let emjpas = dbep.get(`30`)
                let emjexc = dbep.get(`23`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_umporum`)
                            .setLabel(`Adicionar`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_txt`)
                            .setLabel(`Enviar TxT`)
                            .setEmoji(emjpas),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_fantasma`)
                            .setLabel(`Estoque Fantasma`)
                            .setEmoji(emjfan),

                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_limpar`)
                            .setLabel(`Limpar Estoque`)
                            .setEmoji(emjexc),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )
                interaction.update({ embeds: [embed], components: [row, row2] })
            }
            if (customId.endsWith("_configpd_pd_addestoque_limpar")) {
                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setTitle(`Limpando Estoque`)
                    .setCustomId(`${id}_${nome}_modal_configpd_pd_addestoque_limpar`)
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text1`)
                                    .setLabel(`Confirmação`)
                                    .setPlaceholder(`Escreva "SIM"! (Sem as áspas).`)
                            ),
                    )
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_addestoque_fantasma")) {
                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setTitle(`Estoque Fantasma`)
                    .setCustomId(`${id}_${nome}_modal_configpd_pd_addestoque_fantasma`)
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(2)
                                    .setCustomId(`text1`)
                                    .setLabel(`Mensagem`)
                                    .setRequired(false)
                                    .setPlaceholder(`Informe a mensagem que terá no estoque fantasma. Ex: Abra Ticket no canal X.`)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(1)
                                    .setCustomId(`text2`)
                                    .setLabel(`Quantidade`)
                                    .setRequired(true)
                                    .setPlaceholder(`Informe a quantidade do estoque fantasma.`)
                            ),
                    )
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_addestoque_umporum")) {

                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const modal = new ModalBuilder()
                    .setTitle(`Adicionando Estoque`)
                    .setCustomId(`${id}_${nome}_modal_configpd_pd_addestoque_umporum`)
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                new TextInputBuilder()
                                    .setStyle(2)
                                    .setCustomId(`text1`)
                                    .setLabel(`Escrever Estoque`)
                                    .setRequired(true)
                                    .setPlaceholder(`Informe o seu estoque. (Escrevendo um abaixo do outro.)`)
                            ),
                    )
                interaction.showModal(modal)
            }
            if (customId.endsWith("_configpd_pd_addestoque_txt")) {
                const pd = db.get(`${id}`);
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 });
                    return;
                }
                interaction.update({ content: `${dbe.get(`1`)} | Envie em até **1 MINUTO** o arquivo **.TxT** para adicionar ao estoque ou digite **CANCELAR** para cancelar o adicionamento do estoque.`, components: [], embeds: [] }).then(async (msg) => {
                    const filter = message => message.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });
                    
                    collector.on('collect', async (message) => {
                        if (message.content.toLowerCase() === "cancelar") {
                            collector.stop();
                            await resetEmbed(msg, interaction, nome, id);
                            await interaction.followUp({ content: `${dbe.get("6")} | Cancelado!`, flags: 64 })
                            return message.delete()
                        }
            
                        if (message.attachments.size !== 0) {
                            const attachment = message.attachments.first();
                            if (!attachment.name.endsWith('.txt')) {
                                await message.reply({ content: `${dbe.get(`13`)} | Apenas arquivos .txt são permitidos.`, flags: 64 });
                                return resetEmbed(msg, interaction, nome, id);
                            }
                            
                            const fs = require('fs');
                            const https = require('https');
                            const path = require('path');
                            const filePath = path.join(__dirname, attachment.name);
                            const file = fs.createWriteStream(filePath);
            
                            https.get(attachment.url, (response) => {
                                response.pipe(file);
                                file.on('finish', async () => {
                                    file.close(async () => {
                                        const fileContent = fs.readFileSync(filePath, 'utf8');
                                        const linhasNaoVazias = fileContent.split('\n').filter(line => line.trim());
                                        const index = pd.produtos.findIndex(a => a.nome === nome);
                                        const addestoque = pd.produtos[index].estoque || [];
                                        linhasNaoVazias.forEach(linha => addestoque.push(linha.trim()));
                                        db.set(`${id}`, pd);
                                        
                                        await message.delete();
                                        collector.stop();
                                        await interaction.editReply({ embeds: [], components: [], content: `${dbe.get(`16`)} | Aguarde...` });
                                        fs.unlink(filePath, err => { if (err) console.error(err); });
                                        
                                        resetEmbed(msg, interaction, nome, id);
                                        interaction.followUp({ content: `${dbe.get(`6`)} | **${linhasNaoVazias.length}** Produto's adicionados com sucesso!`, flags: 64 });
                                    });
                                });
                            }).on('error', (err) => {
                                fs.unlink(filePath, () => {});
                                console.error(err.message);
                            });
                        }
                    });
                    
                    collector.on('end', async (collected) => {
                        if (collected.size === 0) {
                            resetEmbed(msg, interaction, nome, id);
                            interaction.followUp({ content: `${dbe.get(`2`)} | O tempo acabou :(`, flags: 64 });
                        }
                    });
                });
            }
            
            async function resetEmbed(msg, interaction, nome, id) {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Adicione ou limpe o estoque do produto **${nome}**.`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp();
            
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(2).setCustomId(`${id}_${nome}_configpd_pd_addestoque_umporum`).setLabel(`Adicionar`).setEmoji(dbep.get(`20`)),
                    new ButtonBuilder().setStyle(2).setCustomId(`${id}_${nome}_configpd_pd_addestoque_txt`).setLabel(`Enviar TxT`).setEmoji(dbep.get(`30`)),
                    new ButtonBuilder().setStyle(2).setCustomId(`${id}_${nome}_configpd_pd_addestoque_fantasma`).setLabel(`Estoque Fantasma`).setEmoji(dbep.get(`8`))
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setStyle(4).setCustomId(`${id}_${nome}_configpd_pd_addestoque_limpar`).setLabel(`Limpar Estoque`).setEmoji(dbep.get(`23`)),
                    new ButtonBuilder().setStyle(1).setCustomId(`${id}_${nome}_configpd_pd_voltar`).setLabel(`Voltar`).setEmoji(dbep.get(`29`))
                );
                await msg.edit({ embeds: [embed], components: [row, row2], content: `` });
            }
            
        }
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId;
            const id = customId.split("_")[0]
            const nome = customId.split("_")[1]
            const pd = db.get(`${id}`)
            const x = db.get(`${id}`)

            if (customId.endsWith("_modal_configpd_excluir")) {
                const texto = interaction.fields.getTextInputValue("text1").toLowerCase()

                if (texto !== "sim") {
                    interaction.reply({ content: `${dbe.get(`13`)} | Você escreveu sim errado!`, flags: 64 })
                    return;
                }
                db.delete(`${id}`)
                const banner = `./Imagens/banners/${id}.png`;
                if (fs.existsSync(banner)) {
                    fs.unlinkSync(banner);
                }
                const thumb = `./Imagens/thumbnails/${id}.png`;
                if (fs.existsSync(thumb)) {
                    fs.unlinkSync(thumb);
                }
                interaction.reply({ content: `${dbe.get(`6`)} | Painel excluido.`, flags: 64 })
            }
            if (customId.endsWith("_modal_channel_configpd_select_enviar")) {
                const cor = interaction.fields.getTextInputValue("text")
                const canal = customId.split("_")[1]
                let color = ""
                if (cor) {
                    if (cor.startsWith("#")) {
                        color = cor

                    } else {
                        interaction.reply({ content: `${dbe.get(`13`)} | Cor inválida!`, flags: 64 })
                        return;
                    }
                }
                db.set(`${id}.button`, {
                    color: color
                })
                sendMessage(interaction, id, canal).then(() => {
                    interaction.update({ flags: 64, components: [], content: `${dbe.get("6")} | Mensagem Enviada!` })
                }).catch((err) => {
                    console.log(err)
                    interaction.update({ components: [], flags: 64, content: `${dbe.get("13")} | Erro ao tentar enviar a mensagem!` })
                })
            }
            if (customId.endsWith("_modal_channel_configpd_button_enviar")) {
                const texto = interaction.fields.getTextInputValue("text1")
                const emoji = interaction.fields.getTextInputValue("text2")
                const style = interaction.fields.getTextInputValue("text3").toLowerCase()
                const cor = interaction.fields.getTextInputValue("text4")
                const canal = customId.split("_")[1]
                if (style && style === "azul" || style === "verde" || style === "cinza" || style === "vermelho") {
                    let stylee;
                    if (style === "azul") stylee = 1
                    if (style === "cinza") stylee = 2
                    if (style === "verde") stylee = 3
                    if (style === "vermelho") stylee = 4
                    let emj = ""
                    if (emoji) {
                        const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

                        if (emojiRegex.test(emoji) || emoji.startsWith("<")) {
                            emj = emoji
                        } else {
                            interaction.update({ content: `${dbe.get(`13`)} | Emoji inválido!`, flags: 64 })
                            return;
                        }
                    }
                    let color = ""
                    if (cor) {
                        if (cor.startsWith("#")) {
                            color = cor

                        } else {
                            interaction.update({ components: [], content: `${dbe.get(`13`)} | Cor inválida!`, flags: 64 })
                            return;
                        }
                    }
                    db.set(`${id}.button`, {
                        style: stylee,
                        text: texto,
                        emoji: emj,
                        color: color
                    })
                    sendMessage(interaction, id, canal).then(() => {
                        interaction.update({ components: [], flags: 64, content: `${dbe.get("6")} | Mensagem Enviada!` })
                    }).catch((err) => {
                        console.log(err)
                        interaction.update({ components: [], flags: 64, content: `${dbe.get("13")} | Erro ao tentar enviar a mensagem!` })
                    })
                } else {
                    interaction.update({ components: [], content: `${dbe.get(`13`)} | Cor inválida!`, flags: 64 })
                    return;
                }
            }
        }
        if (interaction.isChannelSelectMenu()) {
            const customId = interaction.customId;
            const id = customId.split("_")[0]
            const nome = customId.split("_")[1]

            if (customId.endsWith("_channel_configpd_enviar")) {
                const channel = interaction.values[0]
                const canal = interaction.guild.channels.cache.get(channel)
                const pd = db.get(`${id}`)
                const x = db.get(`${id}`)

                if (x.produtos.length === 1) {
                    const modal = new ModalBuilder()
                        .setTitle(`Enviando Mensagem de Compra`)
                        .setCustomId(`${id}_${channel}_modal_channel_configpd_button_enviar`)
                    const text1 = new TextInputBuilder()
                        .setCustomId("text1")
                        .setLabel("Texto")
                        .setPlaceholder("Escreva aqui o texto do botão.")
                        .setValue(dbp.get(`painel_button.button.text`) || "")
                        .setStyle(1)
                        .setRequired(true)

                    const text2 = new TextInputBuilder()
                        .setCustomId("text2")
                        .setLabel("Emoji")
                        .setPlaceholder("Escreva aqui o emoji do botão.")
                        .setValue(dbp.get(`painel_button.button.emoji`) || "")
                        .setStyle(1)
                        .setRequired(false)

                    const text3 = new TextInputBuilder()
                        .setCustomId("text3")
                        .setLabel("Cor do Botão")
                        .setPlaceholder("Cores: Azul, verde, cinza e vermelho.")
                        .setStyle(1)
                        .setValue("Cinza")
                        .setRequired(true)

                    const text4 = new TextInputBuilder()
                        .setCustomId("text4")
                        .setLabel("Cor do Painel de Compra")
                        .setPlaceholder("Ex: #ffffff")
                        .setValue(dbc.get(`color`))
                        .setStyle(1)
                        .setRequired(true)
                    modal.addComponents(new ActionRowBuilder().addComponents(text1))
                    modal.addComponents(new ActionRowBuilder().addComponents(text2))
                    modal.addComponents(new ActionRowBuilder().addComponents(text3))
                    modal.addComponents(new ActionRowBuilder().addComponents(text4))
                    interaction.showModal(modal)
                } else if (x.produtos.length > 1) {
                    const modal = new ModalBuilder()
                        .setTitle(`Enviando Mensagem de Compra`)
                        .setCustomId(`${id}_${channel}_modal_channel_configpd_select_enviar`)

                    const text = new TextInputBuilder()
                        .setCustomId("text")
                        .setLabel("Cor do Painel de Compra")
                        .setPlaceholder("Ex: #ffffff")
                        .setStyle(1)
                        .setValue(dbc.get(`color`))
                        .setRequired(true)
                    modal.addComponents(new ActionRowBuilder().addComponents(text))
                    interaction.showModal(modal)
                } else {
                    interaction.update({ flags: 64, components: [], content: `${dbe.get("13")} | Nenhum produto cadastrado no painel, crie um!` })
                }
            }
        }
        if (interaction.isRoleSelectMenu()) {
            const customId = interaction.customId;
            const id = customId.split("_")[0]
            const nome = customId.split("_")[1]

            if (customId.endsWith("_channel_configpd_pd_cargos_cargosproi")) {
                const cargoman = interaction.values
                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                pd.produtos[index].cargosLiberados = cargoman
                db.set(`${id}`, pd)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const cargocliente = interaction.guild.roles.cache.get(pdd.cargocliente)
                const cargocliented = interaction.guild.roles.cache.get(dbc.get(`canais.cargo_cliente`))
                let cargosn = ""
                const a = pdd.cargosLiberados || []
                await a.map((entry, index) => { cargosn += `- ${interaction.guild.roles.cache.get(entry)}\n`; });
                if (a.length <= 0) cargosn = "`🟢 Todos Podem Comprar!`"

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure um cargo cliente alternativo e quem será proibido de comprar o produto.`)
                    .addFields(
                        {
                            name: `Cargo cliente:`,
                            value: `${cargocliente || cargocliented || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Cargos que não podem comprar:`,
                            value: `${cargosn || "Não Definido"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjbol = dbep.get(`3`)
                let emjcai = dbep.get(`35`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cliente`)
                            .setLabel(`Cargo Cliente`)
                            .setEmoji(emjbol),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cargosproi`)
                            .setLabel(`Cargos Proibidos de Comprar`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol),
                    )

                await interaction.update({ embeds: [embed], components: [row] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo proibidos de comprar este produto alterados! Novos cargos é: \n${cargosn}`, flags: 64 })
            }

            if (customId.endsWith("_channel_configpd_pd_cargos_cliente")) {
                const cargoman = interaction.values[0]
                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                pd.produtos[index].cargocliente = cargoman
                db.set(`${id}`, pd)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const cargocliente = interaction.guild.roles.cache.get(pdd.cargocliente)
                const cargocliented = interaction.guild.roles.cache.get(dbc.get(`canais.cargo_cliente`))
                let cargosn = ""
                const a = pdd.cargosLiberados || []
                await a.map((entry, index) => { cargosn += `- ${interaction.guild.roles.cache.get(entry)}\n`; });
                if (a.length <= 0) cargosn = "`🟢 Todos Podem Comprar!`"

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure um cargo cliente alternativo e quem será proibido de comprar o produto.`)
                    .addFields(
                        {
                            name: `Cargo cliente:`,
                            value: `${cargocliente || cargocliented || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Cargos que não podem comprar:`,
                            value: `${cargosn || "Não Definido"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjbol = dbep.get(`3`)
                let emjcai = dbep.get(`35`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cliente`)
                            .setLabel(`Cargo Cliente`)
                            .setEmoji(emjbol),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_cargos_cargosproi`)
                            .setLabel(`Cargos Proibidos de Comprar`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol),
                    )

                await interaction.update({ embeds: [embed], components: [row] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cargo cliente alterado! Novo cargo é ${cargocliente}`, flags: 64 })
            }
        }
        if (interaction.isStringSelectMenu()) {
            const customId = interaction.customId;

            if (customId === "select_produtos") {
                const values = interaction.values[0]
                const id = values.split("_")[0]
                const nome = values.split("_")[1]
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure o produto **${nome}**.`)
                    .addFields(
                        {
                            name: `Nome:`,
                            value: `${pdd.nome}`,
                            inline: true
                        },
                        {
                            name: `Emoji:`,
                            value: `${pdd.emoji || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Preço:`,
                            value: `R$${Number(pdd.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjcai = dbep.get(`35`)
                let emjlap = dbep.get(`1`)
                let emjesc = dbep.get(`22`)
                let emjlup = dbep.get(`15`)
                let emjcli = dbep.get(`31`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_editar`)
                            .setLabel(`Editar`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_cargos`)
                            .setLabel(`Gerenciar Cargos`)
                            .setEmoji(emjcli),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_definicao`)
                            .setLabel(`Definir Condições`)
                            .setEmoji(emjesc),
                    )

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_verestoque`)
                            .setLabel(`Ver Estoque`)
                            .setEmoji(emjlup),
                        new ButtonBuilder()
                            .setStyle(3)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_addestoque`)
                            .setLabel(`Gerenciar Estoque`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )


                interaction.update({ embeds: [embed], components: [row, row2] })
            }

        }
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId;
            const id = customId.split("_")[0]
            const nome = customId.split("_")[1]

            if (customId.endsWith("_modal_configpd_cupom_limpar")) {
                const confirma = interaction.fields.getTextInputValue("text1")

                const pd = db.get(`${id}`)

                if (confirma !== "SIM") {
                    interaction.reply({ content: `${dbe.get(`13`)} | Você não escreveu sim corretamente!`, flags: 64 })
                    return;
                }

                pd.cupons = []
                db.set(`${id}`, pd)
                let cuponss = ""
                const a = pd.cupons || []
                await a.map((entry, index) => { cuponss += `- **Nome:** \`${entry.nome}\`. **Desconto:** \`${entry.porcentagem}%\`. **Valor Máximo:** \`${entry.valormax ? `R$${Number(entry.valormax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Valor Mínimo:** \`${entry.valormin ? `R$${Number(entry.valormin).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Cargo:** ${entry.cargo ? `<@&${entry.cargo}>` : `Não Definido`} \n`; });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Crie, configure ou remova cupons do painel **${pd.id}**!`)
                    .addFields(
                        {
                            name: `Cupons Atuais:`,
                            value: `${cuponss || "Nenhum cupom criado!"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()


                await interaction.update({ embeds: [embed] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cupons limpados com sucesso!`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_cupom_remover")) {
                const nome = interaction.fields.getTextInputValue("text1")
                const confirma = interaction.fields.getTextInputValue("text2")

                const pd = db.get(`${id}`)

                const cupons = pd.cupons || []
                const pdd = cupons.find(a => a.nome === nome);
                const pddd = cupons.filter(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Nenhum cupom tem esse nome!`, flags: 64 })
                    return;
                }
                if (pdd && pddd.length >= 2) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Ja existe um cupom com este nome!`, flags: 64 })
                    return;
                }
                if (confirma !== "SIM") {
                    interaction.reply({ content: `${dbe.get(`13`)} | Você não escreveu sim corretamente!`, flags: 64 })
                    return;
                }

                const cupomIndex = cupons.findIndex(a => a.nome === nome);
                const cup = pd.cupons || []
                cup.splice(cupomIndex, 1)
                pd.cupons = cup
                db.set(`${id}`, pd)
                let cuponss = ""
                const a = pd.cupons || []
                await a.map((entry, index) => { cuponss += `- **Nome:** \`${entry.nome}\`. **Desconto:** \`${entry.porcentagem}%\`. **Valor Máximo:** \`${entry.valormax ? `R$${Number(entry.valormax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Valor Mínimo:** \`${entry.valormin ? `R$${Number(entry.valormin).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Cargo:** ${entry.cargo ? `<@&${entry.cargo}>` : `Não Definido`} \n`; });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Crie, configure ou remova cupons do painel **${pd.id}**!`)
                    .addFields(
                        {
                            name: `Cupons Atuais:`,
                            value: `${cuponss || "Nenhum cupom criado!"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()


                await interaction.update({ embeds: [embed] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cupom apagado com sucesso!`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_cupom_editar")) {
                const nome = interaction.fields.getTextInputValue("text1")
                const idCargo = interaction.fields.getTextInputValue("text2")
                const porcentagem = interaction.fields.getTextInputValue("text3")
                const valormax = interaction.fields.getTextInputValue("text4")
                const valormin = interaction.fields.getTextInputValue("text5")
                const cargo = interaction.guild.roles.cache.get(idCargo)
                const pd = db.get(`${id}`)

                const cupons = pd.cupons || []
                const pdd = cupons.find(a => a.nome === nome);
                const pddd = cupons.filter(a => a.nome === nome);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Nenhum cupom tem esse nome!`, flags: 64 })
                    return;
                }
                if (pdd && pddd.length >= 2) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Ja existe um cupom com este nome!`, flags: 64 })
                    return;
                }

                if (idCargo && !cargo) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Cargo inválido!`, flags: 64 })
                    return;
                }
                if (isNaN(porcentagem)) return interaction.reply({ content: `${dbe.get(`13`)} | Porcentagem inválida!`, flags: 64 })
                if (isNaN(valormax)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor máximo inválido!`, flags: 64 })
                if (isNaN(valormin)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor Mínimo inválido!`, flags: 64 })
                if (porcentagem > 99) return interaction.reply({ content: `${dbe.get(`13`)} | A porcentagem só pode ir até em **99%**!`, flags: 64 })

                const cupomIndex = cupons.findIndex(a => a.nome === nome);
                pd.cupons[cupomIndex].nome = nome

                pd.cupons[cupomIndex].cargo = ""
                pd.cupons[cupomIndex].valormax = ""
                pd.cupons[cupomIndex].valormin = ""
                if (cargo) {
                    pd.cupons[cupomIndex].cargo = idCargo
                }

                pd.cupons[cupomIndex].porcentagem = porcentagem

                if (valormax) pd.cupons[cupomIndex].valormax = valormax
                if (valormin) pd.cupons[cupomIndex].valormin = valormin

                db.set(`${id}`, pd)
                let cuponss = ""
                const a = pd.cupons || []
                await a.map((entry, index) => { cuponss += `- **Nome:** \`${entry.nome}\`. **Desconto:** \`${entry.porcentagem}%\`. **Valor Máximo:** \`${entry.valormax ? `R$${Number(entry.valormax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Valor Mínimo:** \`${entry.valormin ? `R$${Number(entry.valormin).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Cargo:** ${entry.cargo ? `<@&${entry.cargo}>` : `Não Definido`} \n`; });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Crie, configure ou remova cupons do painel **${pd.id}**!`)
                    .addFields(
                        {
                            name: `Cupons Atuais:`,
                            value: `${cuponss || "Nenhum cupom criado!"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()


                await interaction.update({ embeds: [embed] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cupom editado com sucesso!`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_cupom_criar")) {
                const nome = interaction.fields.getTextInputValue("text1")
                const idCargo = interaction.fields.getTextInputValue("text2")
                const porcentagem = interaction.fields.getTextInputValue("text3")
                const valormax = interaction.fields.getTextInputValue("text4")
                const valormin = interaction.fields.getTextInputValue("text5")
                const cargo = interaction.guild.roles.cache.get(idCargo)
                const pd = db.get(`${id}`)

                const cupons = pd.cupons || []
                const pdd = cupons.find(a => a.nome === nome);
                if (pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Ja existe um cupom com este nome!`, flags: 64 })
                    return;
                }

                if (idCargo && !cargo) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Cargo inválido!`, flags: 64 })
                    return;
                }
                if (isNaN(porcentagem)) return interaction.reply({ content: `${dbe.get(`13`)} | Porcentagem inválida!`, flags: 64 })
                if (isNaN(valormax)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor máximo inválido!`, flags: 64 })
                if (isNaN(valormin)) return interaction.reply({ content: `${dbe.get(`13`)} | Valor Mínimo inválido!`, flags: 64 })
                if (porcentagem > 99) return interaction.reply({ content: `${dbe.get(`13`)} | A porcentagem só pode ir até em **99%**!`, flags: 64 })
                const criandocupom = {}

                criandocupom.nome = nome

                criandocupom.cargo = ""
                criandocupom.valormax = ""
                criandocupom.valormin = ""
                if (cargo) {
                    criandocupom.cargo = idCargo
                }

                criandocupom.porcentagem = porcentagem

                if (valormax) criandocupom.valormax = valormax
                if (valormin) criandocupom.valormin = valormin
                await cupons.push(criandocupom)
                pd.cupons = cupons

                db.set(`${id}`, pd)
                let cuponss = ""
                const a = pd.cupons || []
                await a.map((entry, index) => { cuponss += `- **Nome:** \`${entry.nome}\`. **Desconto:** \`${entry.porcentagem}%\`. **Valor Máximo:** \`${entry.valormax ? `R$${Number(entry.valormax).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Valor Mínimo:** \`${entry.valormin ? `R$${Number(entry.valormin).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Não Definido"}\`. **Cargo:** ${entry.cargo ? `<@&${entry.cargo}>` : `Não Definido`} \n`; });

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Crie, configure ou remova cupons do painel **${pd.id}**!`)
                    .addFields(
                        {
                            name: `Cupons Atuais:`,
                            value: `${cuponss || "Nenhum cupom criado!"}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()


                await interaction.update({ embeds: [embed] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Cupom criado com sucesso!`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_pd_addestoque_limpar")) {
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const mensagem = interaction.fields.getTextInputValue("text1")
                if (mensagem === "SIM") {
                    const index = pd.produtos.findIndex(a => a.nome === nome);
                    pd.produtos[index].estoque = []
                    db.set(`${id}`, pd)
                    interaction.reply({ content: `${dbe.get(`6`)} | Estoque resetado com sucesso!`, flags: 64 })
                    const x = db.get(`${id}`)
                    const channel = interaction.guild.channels.cache.get(x.idchannel)
                    if (channel) {
                        updateEspecifico(interaction, x)
                    }
                } else {
                    interaction.reply({ content: `${dbe.get(`13`)} | Você não escrever **SIM** corretamente.`, flags: 64 })
                    return;
                }
            }
            if (customId.endsWith("_modal_configpd_pd_addestoque_fantasma")) {
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                const valor = interaction.fields.getTextInputValue("text2")
                const mensagem = interaction.fields.getTextInputValue("text1")

                if (isNaN(valor)) {

                    interaction.reply({ content: `${dbe.get(`13`)} | Insira um valor válido!`, flags: 64 })
                    return;
                }
                if (valor > 10000) {

                    interaction.reply({ content: `${dbe.get(`13`)} | Limite de **10.000** no estoque fantasma!`, flags: 64 })
                    return;
                }

                const index = pd.produtos.findIndex(a => a.nome === nome);

                const estoque = pd.produtos[index].estoque

                if (mensagem === "") {
                    const linha = `Item fantasma`;
                    for (let i = 0; i < valor; i++) {
                        estoque.push(linha);
                    }
                } else {
                    for (let i = 0; i < valor; i++) {
                        estoque.push(mensagem);
                    }
                }
                db.set(`${id}`, pd)
                const users = pd.produtos[index].notificados || []
                for (const userId of users) {
                    const user = await interaction.guild.members.cache.get(userId)
                    if (user) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${dbe.get(`31`)} Reabastecimento de Estoque!`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setColor(dbc.get("color"))
                            .setDescription(`Olá ${user} 👋.\n- O produto **${nome}** teve um reabastecimento de estoque com **${valor}** produto's adicionado's!`)
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp()

                        if (pd.banner) {
                            embed.setImage(pd.banner)
                        }
                        let row;

                        const channel = interaction.guild.channels.cache.get(pd.idchannel)
                        if (channel) {
                            await channel.messages.fetch(pd.idmsg).then(async (msg) => {
                                row = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setStyle(5)
                                            .setLabel(`Comprar`)
                                            .setURL(`https://discord.com/channels/${interaction.guild.id}/${pd.idchannel}/${pd.idmsg}`)
                                    )
                            })
                        }
                        user.send({ embeds: [embed], components: [row] })
                    }
                }
                const x = db.get(`${id}`)
                const channel = interaction.guild.channels.cache.get(x.idchannel)
                if (channel) {
                    updateEspecifico(interaction, x)
                }
                pd.produtos[index].notificados = []
                db.set(`${id}`, pd)
                interaction.reply({ content: `${dbe.get(`6`)} | Estoque fantasma (**${valor}** Produtos) foram colocados no estoque.`, flags: 64 })

            }

            if (customId.endsWith("_modal_configpd_pd_addestoque_umporum")) {
                const estoque = interaction.fields.getTextInputValue("text1")
                const a = estoque.split("\n")
                const pd = db.get(`${id}`)

                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const index = pd.produtos.findIndex(a => a.nome === nome);
                const estoqueDb = pd.produtos[index].estoque

                await a.map(async (entry) => {
                    await estoqueDb.push(entry)
                })

                db.set(`${id}`, pd)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Adicione ou limpe o estoque do produto **${nome}**. \n- Para remover um produto de forma individual, clique no botão de ver estoque na página principal de configuração do produto, logo após clique no botão remover produto e informe a numeração.`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                let emjvol = dbep.get(`29`)
                let emjmais = dbep.get(`20`)
                let emjfan = dbep.get(`8`)
                let emjpas = dbep.get(`30`)
                let emjexc = dbep.get(`23`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_umporum`)
                            .setLabel(`Adicionar`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_txt`)
                            .setLabel(`Enviar TxT`)
                            .setEmoji(emjpas),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_fantasma`)
                            .setLabel(`Estoque Fantasma`)
                            .setEmoji(emjfan),

                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(4)
                            .setCustomId(`${id}_${nome}_configpd_pd_addestoque_limpar`)
                            .setLabel(`Limpar Estoque`)
                            .setEmoji(emjexc),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${nome}_configpd_pd_voltar`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )
                await interaction.update({ embeds: [embed], components: [row, row2] })
                const users = pd.produtos[index].notificados || []
                for (const userId of users) {
                    const user = await interaction.guild.members.cache.get(userId)
                    if (user) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: `${dbe.get(`31`)} Reabastecimento de Estoque!`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                            .setColor(dbc.get("color"))
                            .setDescription(`Olá ${user} 👋.\n- O produto **${nome}** teve um reabastecimento de estoque com **${a.length}** produto's adicionado's!`)
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setTimestamp()

                        if (pd.banner) {
                            embed.setImage(pd.banner)
                        }
                        let row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(5)
                                    .setLabel(`Ir até o painel do produto.`)
                                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${pd.idchannel}/${pd.idmsg}`)
                            )

                        user.send({ embeds: [embed], components: [row] })
                    }
                }
                const x = db.get(`${id}`)
                const channel = interaction.guild.channels.cache.get(x.idchannel)
                if (channel) {
                    updateEspecifico(interaction, x)
                } else {
                }
                pd.produtos[index].notificados = []
                db.set(`${id}`, pd)
                interaction.followUp({ content: `${dbe.get(`6`)} | **${a.length}** Produto's adicionado's com sucesso!`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_pd_verestoque_remover")) {
                const pd = db.get(`${id}`)
                const pdd = pd.produtos.find(a => a.nome === nome);
                const index = pd.produtos.findIndex(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const idEstoquee = interaction.fields.getTextInputValue("text1")
                if (isNaN(idEstoquee)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Insira uma numeração válida.`, flags: 64 })
                    return;
                }
                const idEstoque = idEstoquee - 1

                const estoque = await pd.produtos[index].estoque
                let pdremoved = estoque.splice(idEstoque, 1);

                db.set(`${id}`, pd)
                interaction.reply({ content: `${dbe.get(`6`)} | Produto com a númeração \`${idEstoquee}\` removido com sucesso!\n\`\`\`${pdremoved}\`\`\``, flags: 64 })
            }
            if (customId.endsWith("_modal_configpd_pd_definicao")) {
                const cargoId = interaction.fields.getTextInputValue("text1")
                const cargo = interaction.guild.roles.cache.get(cargoId)
                const valormx = interaction.fields.getTextInputValue("text2")
                const valormn = interaction.fields.getTextInputValue("text3")

                if (valormx && isNaN(valormx) || valormn && isNaN(valormn)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Insira valores válidos!`, flags: 64 })
                    return;
                }

                const pd = db.get(`${id}`)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                let cargoo
                if (cargoId) {
                    if (!cargo) {
                        interaction.reply({ content: `${dbe.get(`13`)} | Insira um ID de Cargo válido!`, flags: 64 })
                        return;
                    }
                    cargoo = cargoId
                }
                pd.produtos[index].condições.cargo = cargoId || ""
                pd.produtos[index].condições.valormaximo = valormx || ""
                pd.produtos[index].condições.valorminimo = valormn || ""
                db.set(`${id}`, pd)
                const pdd = pd.produtos.find(a => a.nome === nome);
                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure o produto **${nome}**.`)
                    .addFields(
                        {
                            name: `Nome:`,
                            value: `${pdd.nome}`,
                            inline: true
                        },
                        {
                            name: `Emoji:`,
                            value: `${pdd.emoji || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Preço:`,
                            value: `R$${Number(pdd.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjcai = dbep.get(`35`)
                let emjlap = dbep.get(`1`)
                let emjesc = dbep.get(`22`)
                let emjlup = dbep.get(`15`)
                let emjcli = dbep.get(`31`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_editar`)
                            .setLabel(`Editar`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_cargos`)
                            .setLabel(`Gerenciar Cargos`)
                            .setEmoji(emjcli),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_definicao`)
                            .setLabel(`Definir Condições`)
                            .setEmoji(emjesc),
                    )

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_verestoque`)
                            .setLabel(`Ver Estoque`)
                            .setEmoji(emjlup),
                        new ButtonBuilder()
                            .setStyle(3)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_addestoque`)
                            .setLabel(`Gerenciar Estoque`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )


                await interaction.update({ embeds: [embed], components: [row, row2] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Informações de condições alteradas.`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_pd_editar")) {
                const pd = db.get(`${id}`)
                const nome1 = interaction.fields.getTextInputValue("text1");
                const emoji = interaction.fields.getTextInputValue("text2");
                const preco = interaction.fields.getTextInputValue("text3");

                const pdd = pd.produtos.find(a => a.nome === nome);

                const pdddd = pd.produtos.findIndex(a => a.nome === nome);
                pd.produtos[pdddd].nome = nome1
                const pddd = pd.produtos.filter(a => a.nome === nome1);

                if (!pdd) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                if (emoji) {

                    // Regex para verificar se é um emoji do Discord (estático ou animado)
                    const discordEmojiRegex = /^<a?:[a-zA-Z0-9_]+:\d+>$/;

                    // Regex para verificar se é um emoji padrão (Unicode)
                    const unicodeEmojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{200D}\u{20E3}\u{FE0F}\u{1F000}-\u{1FFFF}]+$/u;

                    if (!discordEmojiRegex.test(emoji) && !unicodeEmojiRegex.test(emoji)) {
                        return interaction.reply({ content: `${dbe.get("13")} | Emoji inválido! `, flags: 64 });
                    }
                }
                if (pddd.length >= 2) {
                    pd.produtos[pdddd].nome = nome
                    interaction.reply({ content: `${dbe.get(`13`)} | Ja tem um produto com o mesmo nome!`, flags: 64 })
                    return;
                }

                pd.produtos[pdddd].emoji = emoji || ""
                pd.produtos[pdddd].preco = preco

                db.set(`${id}`, pd)

                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure o produto **${nome}**.`)
                    .addFields(
                        {
                            name: `Nome:`,
                            value: `${pdd.nome}`,
                            inline: true
                        },
                        {
                            name: `Emoji:`,
                            value: `${pdd.emoji || "Não Definido"}`,
                            inline: true
                        },
                        {
                            name: `Preço:`,
                            value: `R$${Number(pdd.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                let emjcai = dbep.get(`35`)
                let emjlap = dbep.get(`1`)
                let emjesc = dbep.get(`22`)
                let emjlup = dbep.get(`15`)
                let emjcli = dbep.get(`31`)
                let emjvol = dbep.get(`29`)

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_editar`)
                            .setLabel(`Editar`)
                            .setEmoji(emjlap),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_cargos`)
                            .setLabel(`Gerenciar Cargos`)
                            .setEmoji(emjcli),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_definicao`)
                            .setLabel(`Definir Condições`)
                            .setEmoji(emjesc),
                    )

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_verestoque`)
                            .setLabel(`Ver Estoque`)
                            .setEmoji(emjlup),
                        new ButtonBuilder()
                            .setStyle(3)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd_addestoque`)
                            .setLabel(`Gerenciar Estoque`)
                            .setEmoji(emjcai),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_${pdd.nome}_configpd_pd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )


                await interaction.update({ embeds: [embed], components: [row, row2] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Informações do produto alteradas.`, flags: 64 })
            }

            if (customId.endsWith("_modal_configpd_pd_sub")) {
                const nome = interaction.fields.getTextInputValue("text1");
                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                const find = pd.produtos.find(a => a.nome === nome)
                const index = pd.produtos.findIndex(a => a.nome === nome);
                if (!find) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Produto não encontrado.`, flags: 64 })
                    return;
                }
                pd.produtos.splice(index, 1)
                await db.set(`${id}`, pd)
                let produto = ""

                await pd.produtos.slice(0, 10).map((entry, index) => {
                    produto += `> **Nome:** \`${entry.nome}\`. **Estoque:** \`${entry.estoque.length}\`. **Valor:** \`R$${Number(entry.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`\n`;
                });
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Selecione um produto que você deseja configurar.`)
                    .addFields(
                        {
                            name: `Detalhes dos Produtos:`,
                            value: `${produto || "Nenhum Produto Criado."}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                const actionrowselect = new StringSelectMenuBuilder()
                    .setCustomId('select_produtos')
                    .setPlaceholder(`Selecione um produto! (Total ${pd.produtos.length})`)

                let emjcai = dbep.get(`35`)

                if (pd.produtos.length <= 0) {
                    actionrowselect.addOptions(
                        {
                            label: `Não tem produtos, crie um!`,
                            value: `nenhum_produto`
                        }
                    )
                }
                await pd.produtos.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Nome: ${entry.nome}`,
                            description: `Valor: R$${entry.preco}, Estoque: ${entry.estoque.length}`,
                            emoji: emjcai,
                            value: `${id}_${entry.nome}`
                        }
                    )
                })

                const select = new ActionRowBuilder()
                    .addComponents(actionrowselect)
                let emjvol = dbep.get(`29`)
                let emjmais = dbep.get(`20`)
                let emjmenos = dbep.get(`21`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_add`)
                            .setLabel(`Adicionar Produto`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_sub`)
                            .setLabel(`Remover Produto`)
                            .setEmoji(emjmenos),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_configpd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )
                await interaction.update({ embeds: [embed], components: [select, row] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Produto Deletado!`, flags: 64 })
            }
            if (customId.endsWith("_modal_configpd_pd_add")) {
                const nome = interaction.fields.getTextInputValue("text1");
                const emoji = interaction.fields.getTextInputValue("text2") || "";
                const preco = interaction.fields.getTextInputValue("text3");


                if (!db.has(id)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Painel não encontrado.`, flags: 64 })
                    return;
                }
                if (emoji) {

                    // Regex para verificar se é um emoji do Discord (estático ou animado)
                    const discordEmojiRegex = /^<a?:[a-zA-Z0-9_]+:\d+>$/;

                    // Regex para verificar se é um emoji padrão (Unicode)
                    const unicodeEmojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{200D}\u{20E3}\u{FE0F}\u{1F000}-\u{1FFFF}]+$/u;

                    if (!discordEmojiRegex.test(emoji) && !unicodeEmojiRegex.test(emoji)) {
                        return interaction.reply({ content: `${dbe.get("13")} | Emoji inválido! `, flags: 64 });
                    }
                }
                if (isNaN(preco)) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Preço inválido.`, flags: 64 })
                    return;
                }
                const pd = await db.get(`${id}`)
                const produtos = pd.produtos || []
                const filter = await produtos.find(produto => produto.id === nome);
                if (filter) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Este produto ja existe!`, flags: 64 })
                    return;
                }
                if (pd.produtos.length >= 20) {
                    interaction.reply({ content: `${dbe.get(`13`)} | O máximo de produtos cadastrados atingidos.`, flags: 64 })
                    return;
                }
                await db.push(`${id}.produtos`,
                    {
                        nome: nome,
                        emoji: emoji,
                        preco: preco,
                        estoque: [],
                        condições: {}
                    }
                )


                let produto = ""

                await pd.produtos.slice(0, 10).map((entry, index) => {
                    produto += `> **Nome:** \`${entry.nome}\`. **Estoque:** \`${entry.estoque.length}\`. **Valor:** \`R$${Number(entry.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`\n`;
                });
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Selecione um produto que você deseja configurar.`)
                    .addFields(
                        {
                            name: `Detalhes dos Produtos:`,
                            value: `${produto || "Nenhum Produto Criado."}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()

                const actionrowselect = new StringSelectMenuBuilder()
                    .setCustomId('select_produtos')
                    .setPlaceholder(`Selecione um produto! (Total ${db.get(`${id}`).produtos.length})`)

                let emjcai = dbep.get(`35`)

                if (await db.get(`${id}`).produtos.length <= 0) {
                    actionrowselect.addOptions(
                        {
                            label: `Não tem produtos, crie um!`,
                            value: `nenhum_produto`
                        }
                    )
                }
                await db.get(`${id}`).produtos.map(async (entry) => {
                    actionrowselect.addOptions(
                        {
                            label: `Nome: ${entry.nome}`,
                            description: `Valor: R$${entry.preco}, Estoque: ${entry.estoque.length}`,
                            emoji: emjcai,
                            value: `${id}_${entry.nome}`
                        }
                    )
                })

                const select = new ActionRowBuilder()
                    .addComponents(actionrowselect)
                let emjvol = dbep.get(`29`)
                let emjmais = dbep.get(`20`)
                let emjmenos = dbep.get(`21`)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_add`)
                            .setLabel(`Adicionar Produto`)
                            .setEmoji(emjmais),
                        new ButtonBuilder()
                            .setStyle(2)
                            .setCustomId(`${id}_configpd_pd_sub`)
                            .setLabel(`Remover Produto`)
                            .setEmoji(emjmenos),
                        new ButtonBuilder()
                            .setStyle(1)
                            .setCustomId(`${id}_configpd`)
                            .setLabel(`Voltar`)
                            .setEmoji(emjvol)
                    )
                await interaction.update({ embeds: [embed], components: [select, row] })
                interaction.followUp({ content: `${dbe.get(`6`)} | Produto Criado!`, flags: 64 })
            }
            if (customId.endsWith("_modal_configpd_este")) {
                const titulo = interaction.fields.getTextInputValue("text1");
                const desc = interaction.fields.getTextInputValue("text2");
                const banner = interaction.fields.getTextInputValue("text3");
                const thumb = interaction.fields.getTextInputValue("text4");

                if (banner && !banner.startsWith("https://")) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Link do Banner Inválido!`, flags: 64 })
                    return;
                }
                if (thumb && !thumb.startsWith("https://")) {
                    interaction.reply({ content: `${dbe.get(`13`)} | Link da Thumbnail Inválida!`, flags: 64 })
                    return;
                }

                await db.set(`${id}.id`, id)
                await db.set(`${id}.titulo`, titulo)
                await db.set(`${id}.desc`, desc)
                if (banner) {
                    await db.set(`${id}.banner`, banner)
                    const imagePath = `./Imagens/banners/${id}.png`;
                    const dirPath = './Imagens/banners'; // Diretório da imagem

                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true }); // Cria a pasta caso não exista
                    }

                    const response = await axios({
                        url: banner,
                        responseType: 'arraybuffer'
                    });

                    await sharp(response.data)
                        .png()
                        .toFile(imagePath, async (err) => { })
                } else {
                    await db.delete(`${id}.banner`)
                    const caminhoArquivo = `./Imagens/banners/${id}.png`;
                    if (fs.existsSync(caminhoArquivo)) {
                        fs.unlinkSync(caminhoArquivo);
                    }
                }
                if (thumb) {
                    await db.set(`${id}.thumb`, thumb)
                } else {
                    await db.delete(`${id}.thumb`)
                }
                const pd = await db.get(`${id}`)
                const embed = new EmbedBuilder()
                    .setAuthor({ name: "Configurando Produto", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setColor(dbc.get("color"))
                    .setDescription(`Olá ${interaction.user} 👋.\n- Configure e personalize o painel **${pd.id}**`)
                    .addFields(
                        {
                            name: `ID:`,
                            value: `${pd.id}`,
                            inline: true
                        },
                        {
                            name: `Produtos:`,
                            value: `${pd.produtos.length} Produtos.`,
                            inline: true
                        },
                        {
                            name: `Título:`,
                            value: `${pd.titulo}`,
                            inline: true
                        },
                        {
                            name: `Descrição:`,
                            value: `${pd.desc}`,
                            inline: true
                        },
                    )
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                interaction.update({ embeds: [embed], content: "" })
            }
        }
        if (aa === "teste") {
            interaction.reply({ content: "Testado amigo :)", flags: 64 })
        }
        if (aa === "config_rendimentos") {
            // Formatador com o fuso horário do Brasil
            const formatador = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
            // Obtém a data atual no horário do Brasil
            const brasilDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const dataHoje = formatador.format(brasilDate);
            const hojepedidos = dbr.get(`${dataHoje}.pedidos`) || 0;
            const hojerecebimentos = dbr.get(`${dataHoje}.recebimentos`) || 0;
            const embed = new EmbedBuilder()
                .setAuthor({ name: "💸 Redimentos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Veja os rendimentos de vendas do bot hoje logo abaixo. Para ver de outros tempos clique nos botões abaixo.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Vendas Realizadas:`, value: `${hojepedidos} ${hojepedidos === 1 ? "venda" : "vendas"}.`, inline: true },
                    { name: `Dinheiro Arrecadado:`, value: `R$${Number(hojerecebimentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, inline: true },
                )

            let emjvol = dbep.get(`29`)

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_rendimentos_7`)
                        .setLabel(`7 Dias`),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_rendimentos_15`)
                        .setLabel("15 Dias"),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_rendimentos_30`)
                        .setLabel("30 Dias"),
                    new ButtonBuilder()
                        .setStyle(2)
                        .setCustomId(`config_rendimentos_total`)
                        .setLabel("Todo o período"),
                    new ButtonBuilder()
                        .setStyle(1)
                        .setCustomId(`config_produtos_voltar`)
                        .setLabel("Voltar")
                        .setEmoji(emjvol)
                )
            interaction.update({ embeds: [embed], components: [row], content: "", flags: 64 })
        }
        if (aa === "config_rendimentos_30") {
            const diasParaSubtrair = 30;

            // Formatador com o fuso horário do Brasil
            const formatador = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });
            // Obtém a data atual no horário do Brasil
            const brasilDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const dataHoje = formatador.format(brasilDate);
            // Pega valores do banco para hoje
            const hojepedidos = dbr.get(`${dataHoje}.pedidos`) || 0;
            const hojerecebimentos = dbr.get(`${dataHoje}.recebimentos`) || 0;

            let pedidos = Number(hojepedidos);
            let recebimentos = Number(hojerecebimentos);

            // Loop para os últimos 7 dias
            for (let i = 1; i <= diasParaSubtrair; i++) {
                const data = new Date(brasilDate); // Começa da data de hoje no Brasil
                data.setDate(data.getDate() - i); // Subtrai dias
                const dataBrasil = formatador.format(data);

                pedidos += Number(dbr.get(`${dataBrasil}.pedidos`) || 0);
                recebimentos += Number(dbr.get(`${dataBrasil}.recebimentos`) || 0);
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: "💸 Redimentos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Veja os rendimentos acumulados nos últimos 30 dias.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Vendas Realizadas:`, value: `${pedidos} ${pedidos === 1 ? "venda" : "vendas"}.`, inline: true },
                    { name: `Dinheiro Arrecadado:`, value: `R$${Number(recebimentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, inline: true },
                )
            interaction.reply({ embeds: [embed], content: "", flags: 64 })
        }
        if (aa === "config_rendimentos_15") {
            const diasParaSubtrair = 15;

            // Formatador com o fuso horário do Brasil
            const formatador = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });

            // Obtém a data atual no horário do Brasil
            const brasilDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const dataHoje = formatador.format(brasilDate);

            // Pega valores do banco para hoje
            const hojepedidos = dbr.get(`${dataHoje}.pedidos`) || 0;
            const hojerecebimentos = dbr.get(`${dataHoje}.recebimentos`) || 0;

            let pedidos = Number(hojepedidos);
            let recebimentos = Number(hojerecebimentos);

            // Loop para os últimos 7 dias
            for (let i = 1; i <= diasParaSubtrair; i++) {
                const data = new Date(brasilDate); // Começa da data de hoje no Brasil
                data.setDate(data.getDate() - i); // Subtrai dias
                const dataBrasil = formatador.format(data);

                pedidos += Number(dbr.get(`${dataBrasil}.pedidos`) || 0);
                recebimentos += Number(dbr.get(`${dataBrasil}.recebimentos`) || 0);
            }
            const embed = new EmbedBuilder()
                .setAuthor({ name: "💸 Redimentos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Veja os rendimentos acumulados nos últimos 15 dias.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Vendas Realizadas:`, value: `${pedidos} ${pedidos === 1 ? "venda" : "vendas"}.`, inline: true },
                    { name: `Dinheiro Arrecadado:`, value: `R$${Number(recebimentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, inline: true },
                )
            interaction.reply({ embeds: [embed], content: "", flags: 64 })
        }
        if (aa === "config_rendimentos_7") {
            const diasParaSubtrair = 7;

            // Formatador com o fuso horário do Brasil
            const formatador = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' });

            // Obtém a data atual no horário do Brasil
            const brasilDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const dataHoje = formatador.format(brasilDate);

            // Pega valores do banco para hoje
            const hojepedidos = dbr.get(`${dataHoje}.pedidos`) || 0;
            const hojerecebimentos = dbr.get(`${dataHoje}.recebimentos`) || 0;

            let pedidos = Number(hojepedidos);
            let recebimentos = Number(hojerecebimentos);

            // Loop para os últimos 7 dias
            for (let i = 1; i <= diasParaSubtrair; i++) {
                const data = new Date(brasilDate); // Começa da data de hoje no Brasil
                data.setDate(data.getDate() - i); // Subtrai dias
                const dataBrasil = formatador.format(data);

                pedidos += Number(dbr.get(`${dataBrasil}.pedidos`) || 0);
                recebimentos += Number(dbr.get(`${dataBrasil}.recebimentos`) || 0);
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: "💸 Redimentos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Veja os rendimentos acumulados nos últimos 7 dias.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Vendas Realizadas:`, value: `${pedidos} ${pedidos === 1 ? "venda" : "vendas"}.`, inline: true },
                    { name: `Dinheiro Arrecadado:`, value: `R$${Number(recebimentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, inline: true },
                )
            interaction.reply({ embeds: [embed], content: "", flags: 64 })
        }
        if (aa === "config_rendimentos_total") {
            const embed = new EmbedBuilder()
                .setAuthor({ name: "💸 Redimentos", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setColor(dbc.get("color"))
                .setDescription(`Olá ${interaction.user} 👋.\n- Veja os rendimentos acumulados durante todo o período de vendas.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .addFields(
                    { name: `Vendas Realizadas:`, value: `${dbr.get(`pedidostotal`)} ${dbr.get(`pedidostotal`) === 1 ? "venda" : "vendas"}.`, inline: true },
                    { name: `Dinheiro Arrecadado:`, value: `R$${Number(dbr.get(`gastostotal`)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`, inline: true },
                )
            interaction.reply({ embeds: [embed], content: "", flags: 64 })
        }
    }
}