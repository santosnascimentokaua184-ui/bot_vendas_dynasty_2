const { EmbedBuilder, AuditLogEvent, AttachmentBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const fs = require("fs");  // Para manipulação de arquivos

const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json" });

module.exports = {
    name: "messageDelete",
    run: async (messages) => {
        if (!messages.guild) return; // Ignora DMs

        const logChannel = messages.guild.channels.cache.get(dbc.get("logsStaff.channel"));
        if (!logChannel) return; // Verifica se o canal de logs existe

        if (dbc.get("logsStaff.messages") !== "ON") return;

        // Pega o log da auditoria de quem apagou
        const fetchedLogs = await messages.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MessageDelete,
        });
        const deletionLog = fetchedLogs.entries.first();
        if (!deletionLog) return;

        const { executor } = deletionLog;
        if (executor.bot) return;
        // Cria o Embed básico
        const embed = new EmbedBuilder()
            .setAuthor({ name: `🗑️ Mensagem Apagada!`, iconURL: messages.author.displayAvatarURL() })
            .setColor("FF0000")
            .setDescription(`**Apagada por:** ${executor}\n\n**Mensagem:**\n\`\`\`${messages.content || "*Sem conteúdo*"}\`\`\``)
            .addFields(
                { name: "👤 Autor:", value: `- \`👋\` Menção: ${messages.author}\n- \`📇\` Nome: ${messages.author.username}\n- \`🆔\` ID do usuário: ${messages.author.id}`, inline:true },
                { name: `📃 Informações da mensagem:`, value: `- \`📺\` Canal enviado: <#${messages.channel.id}>\n- \`⏰\` Foi enviada: <t:${Math.floor(messages.createdTimestamp / 1000)}:R>\n- \`🖼️\` Imagens anexadas: ${messages.attachments.size > 0 ? "`🟢 Tinha imagens, tudo anexado acima.`" : "`🔴 Sem imagens`"}`, inline:true },
            )
            .setFooter({ text: `Canal: #${messages.channel.name}` })
            .setTimestamp();

        // Adiciona os anexos, caso haja
        if (messages.attachments.size > 0) {
            const attachments = messages.attachments.map(attachment => attachment.url);
            logChannel.send({ embeds: [embed], files: attachments });
        } else {
            logChannel.send({ embeds: [embed] });
        }
    },
};
