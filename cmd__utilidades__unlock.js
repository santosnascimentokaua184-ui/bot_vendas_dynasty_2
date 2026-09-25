const Discord = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json"})
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json"})
module.exports = {
    name: `unlock`,
    description: `🤖 | Destranque o chat.`,
    type: Discord.ApplicationCommandType.ChatInput,

    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) 
        return interaction.reply({ flags: 64, content: `${dbe.get(`13`)} | Você não tem permissão para usar este comando!`})
        await interaction.reply({
            content:`${dbe.get(`16`)} | Aguarde um momento..`
        });
        await interaction.channel.permissionOverwrites.edit(interaction.guild.id,{
            SendMessages: true
        });
        await interaction.channel.permissionOverwrites.edit(interaction.user.id,{
            SendMessages: true
        });
        interaction.editReply({
            content:`${dbe.get(`6`)} | Canal Desbloqueado com sucessso!`,
            embeds: [
                new Discord.EmbedBuilder()
                .setAuthor({ name: `${interaction.user.displayName} abriu o canal!`, iconURL: interaction.user.displayAvatarURL()})
                .setColor(dbc.get(`color`))
                .setDescription(`- O usuário ${interaction.user} deu o comando \`/unlock\`, então eu resolvi abrir o canal. 😉`)
                .setTimestamp()
                .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL()})
            ]
        })
    }
}