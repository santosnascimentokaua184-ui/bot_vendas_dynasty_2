const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Attachment, AttachmentBuilder} = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json"})
const dc = new JsonDatabase({ databasePath: "./data__carrinho.json"})
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json"})
const db = new JsonDatabase({ databasePath: "./data__produtos.json"})
const dbr = new JsonDatabase({ databasePath: "./data__rendimentos.json"})
const dbru = new JsonDatabase({ databasePath: "./data__rankUsers.json"})
const Discord = require("discord.js")
const dbrp = new JsonDatabase({ databasePath: "./data__rankProdutos.json"})
const dbcp = new JsonDatabase({ databasePath: "./data__perfil.json"})
const fs = require("fs")
const dbp = new JsonDatabase({ databasePath: "./data__perms.json" });

module.exports = {
    name: `aprovar`,
    description: `🤖 | Aprove uma compra.`,
    type: Discord.ApplicationCommandType.ChatInput,

    run: async(client, interaction) => {
        if (interaction.user.id !== dbp.get(`${interaction.user.id}`)) {
            interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Você não tem permissão para usar este comando!`})
            return;
        }
        if (!dc.has(`${interaction.channel.id}`)) {
            interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Não existe nenhum carrinho neste canal!`})
            return;
        }

        if (dc.get(`${interaction.channel.id}.eSales`) === "ON") {
            await interaction.reply({ content: `${dbe.get(`13`)} | Não é possivel aprovar um carrinho no modo \`Esales\``, flags: 64 })
            return;
        }
        
        if (dbc.get("pagamentos.sistema_efi") === "ON") return interaction.reply({ content: `${dbe.get(`13`)} | Comando indisponível no momento.`, flags: 64 })

        dc.set(`${interaction.channel.id}.status`, "aprovado")
        dc.set(`${interaction.channel.id}.forma`, "manualmente")

        interaction.reply({ flags: 64, content: `${dbe.get(`6`)} | Carrinho aprovado com sucesso!`})
    }
}