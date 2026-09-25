const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Attachment, AttachmentBuilder} = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json"})
const dc = new JsonDatabase({ databasePath: "./data__carrinho.json"})
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json"})
const dbp = new JsonDatabase({ databasePath: "./data__perms.json"})
const db = new JsonDatabase({ databasePath: "./data__produtos.json"})
const dbr = new JsonDatabase({ databasePath: "./data__rendimentos.json"})
const dbru = new JsonDatabase({ databasePath: "./data__rankUsers.json"})
const dbrp = new JsonDatabase({ databasePath: "./data__rankProdutos.json"})
const dbcp = new JsonDatabase({ databasePath: "./data__perfil.json"})
const fs = require("fs")
const Discord = require("discord.js")
const moment = require("moment")

module.exports = {
    name: "rank",
    description:"🤖 | Exiba o rank de clientes com o valor gasto",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "clientes",
            description: "🤖 | Exiba o rank de clientes com o valor gasto",
            type: Discord.ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "produtos",
            description: "🤖 | Exiba o rank de produtos que mais venderam.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
        }
    ],
    run: async (client, interaction,) => {
        if (interaction.options.getSubcommand() === "produtos") {
            if (interaction.user.id !== dbp.get(`${interaction.user.id}`)) {
                return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Você não tem permissão para usar este comando!` });
            }
            const grana = dbrp.all().filter(i => i.data.valoresganhos).sort((a, b) => b.data.valoresganhos - a.data.valoresganhos);
        
            if (grana.length < 1) {
                interaction.reply(`Nenhum produto no rank`);
            }
            const pageSize = 10;
            let page = 0;
        
            const displayPage = () => {
                const pageStart = page * pageSize;
                const pageEnd = pageStart + pageSize;
                const pageItems = grana.slice(pageStart, pageEnd);
                
                let start = (page - 1) * pageSize;
                let end = start + pageSize;
                
                const numInicial = page * pageSize + 1; 
                
                const formattedValues = pageItems.map((entry, index) => {
                    const numRanking = numInicial + index;
                    
                    return `-# **__${numRanking}°__** - ${entry.ID} - **Valor acumulado:** R$${Number(entry.data.valoresganhos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0"}. **Vendeu:** ${entry.data.vendasfeitas} ${entry.data.vendasfeitas === 1 ? "vez" : "vezes"}.`;
                }).join('\n');
    
                const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId('primeiraPagina')
                    .setEmoji('⏮️')
                    .setDisabled(page === 0)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('voltar')
                    .setEmoji('⬅️')
                    .setDisabled(page === 0)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('proximo')
                    .setEmoji('➡️')
                    .setDisabled(page === Math.ceil(grana.length / pageSize) - 1)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('ultimaPagina')
                    .setEmoji('⏭️')
                    .setDisabled(page === Math.ceil(grana.length / pageSize) - 1)
                    .setStyle(2),
                );
                
                
                const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: `📦 Rank de produtos!`, iconURL: interaction.guild.iconURL()})
                .setColor(dbc.get(`color`) || "Default")
                .setFooter({text:`Página ${page + 1} de ${Math.ceil(grana.length / pageSize)}`})
                .setDescription(`\n${formattedValues}`);
                
                return { embed, components: [row], flags: 64 };
            };
        
            const { embed, components } = displayPage();
            const sentMessage = await interaction.reply({ embeds: [embed], components});
            
            const collector = sentMessage.createMessageComponentCollector({ componentType: Discord.ComponentType.Button });
            
            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== interaction.user.id) {
                    return;
                }
                
                if (interaction.customId === 'proximo') {
                    page += 1;
                } else if (interaction.customId === 'voltar') {
                    page -= 1;
                } else if (interaction.customId === 'ultimaPagina') {
                    page = Math.ceil(grana.length / pageSize) - 1;
                } else if (interaction.customId === 'primeiraPagina') {
                    page = 0;
                }
                const { embed, components } = displayPage();
                await interaction.update({ embeds: [embed], components });
            });
        }
        if (interaction.options.getSubcommand() === "clientes") {
            const grana = dbru.all().filter(i => i.data.gastosaprovados).sort((a, b) => b.data.gastosaprovados - a.data.gastosaprovados);
        
            if (grana.length < 1) {
                interaction.reply(`Ninguém está no rank`);
            }
            const database = dbru.all();
            const pageSize = 10;
            let page = 0;
        
            const displayPage = () => {
                const pageStart = page * pageSize;
                const pageEnd = pageStart + pageSize;
                const pageItems = grana.slice(pageStart, pageEnd);
                
                let start = (page - 1) * pageSize;
                let end = start + pageSize;
                
                const numInicial = page * pageSize + 1; 
                
                const formattedValues = pageItems.map((entry, index) => {
                    const numRanking = numInicial + index;
                    
                    return `-# **\`${numRanking}.\`** - <@${entry.ID}> - **Gastou:** R$${Number(entry.data.gastosaprovados).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0"}. **Comprou:** ${entry.data.pedidosaprovados} ${entry.data.pedidosaprovados === 1 ? "vez" : "vezes"}.`;
                }).join('\n');
    
                const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId('primeiraPagina')
                    .setEmoji('⏮️')
                    .setDisabled(page === 0)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('voltar')
                    .setEmoji('⬅️')
                    .setDisabled(page === 0)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('proximo')
                    .setEmoji('➡️')
                    .setDisabled(page === Math.ceil(grana.length / pageSize) - 1)
                    .setStyle(2),
                    new Discord.ButtonBuilder()
                    .setCustomId('ultimaPagina')
                    .setEmoji('⏭️')
                    .setDisabled(page === Math.ceil(grana.length / pageSize) - 1)
                    .setStyle(2),
                );
                
                
                const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: `💸 Rank de clientes!`, iconURL: interaction.guild.iconURL()})
                .setColor(dbc.get(`color`) || "Default")
                .setFooter({text:`Página ${page + 1} de ${Math.ceil(grana.length / pageSize)}`})
                .setDescription(`\n${formattedValues}`);
                
                return { embed, components: [row] };
            };
        
            const { embed, components } = displayPage();
            const sentMessage = await interaction.reply({ embeds: [embed], components});
            
            const collector = sentMessage.createMessageComponentCollector({ componentType: Discord.ComponentType.Button });
            
            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== interaction.user.id) {
                    return;
                }
                
                if (interaction.customId === 'proximo') {
                    page += 1;
                } else if (interaction.customId === 'voltar') {
                    page -= 1;
                } else if (interaction.customId === 'ultimaPagina') {
                    page = Math.ceil(grana.length / pageSize) - 1;
                } else if (interaction.customId === 'primeiraPagina') {
                    page = 0;
                }
                const { embed, components } = displayPage();
                await interaction.update({ embeds: [embed], components });
            });
        }
    },
};