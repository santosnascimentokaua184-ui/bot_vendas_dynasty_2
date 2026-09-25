const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const { JsonDatabase } = require("wio.db");

const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json" });

module.exports = {
    name: "guildMemberRemove",
    run: async (member) => {
        if (!member.guild) return;

        const logChannel = member.guild.channels.cache.get(dbc.get("logsStaff.channel"));
        if (!logChannel) return; // Verifica se o canal de logs existe

        if (dbc.get("logsStaff.members") !== "ON") return;

        // Obtém o log de auditoria para verificar quem expulsou o usuário
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });

        const kickLog = fetchedLogs.entries.first();
        if (!kickLog) return;

        const { executor, target, reason } = kickLog; // Executor e alvo do kick

        // Verifica se o usuário expulso é o mesmo do evento
        if (target.id !== member.id) return;

        // Criando o embed de log
        const embed = new EmbedBuilder()
            .setAuthor({ name: `⚠️ Usuário Expulso!`, iconURL: member.user.displayAvatarURL() })
            .setColor("FFA500")
            .setDescription(`**Expulso por:** ${executor}\n**Motivo:** \`\`\`${reason || "Nenhum motivo especificado"}\`\`\``)
            .addFields(
                { name: "👤 Usuário Expulso:", value: `- \`👋\` Menção: ${member.user}\n- \`📇\` Nome: ${member.user.username}\n- \`🆔\` ID do usuário: ${member.user.id}`, inline: true },
                { name: "📅 Data da Expulsão:", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: `Servidor: ${member.guild.name}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
