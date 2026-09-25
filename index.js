const Discord = require("discord.js");

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("❌ Defina a variável DISCORD_TOKEN no Railway.");
  process.exit(1);
}

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
  ]
});

client.slashCommands = new Discord.Collection();

client.on("interactionCreate", async (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);

    if (!cmd) {
      console.error(`❌ Comando não encontrado: ${interaction.commandName}`);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "Comando não encontrado.", flags: 64 }).catch(() => {});
      }
      return;
    }

    if (interaction.guild) {
      interaction.member = interaction.guild.members.cache.get(interaction.user.id) || interaction.member;
    }

    try {
      await cmd.run(client, interaction);
    } catch (error) {
      console.error(`❌ Erro executando /${interaction.commandName}:`, error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "Ocorreu um erro ao executar este comando.", flags: 64 }).catch(() => {});
      }
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command || typeof command.autocomplete !== "function") return;

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(`❌ Erro no autocomplete /${interaction.commandName}:`, error);
  }
});

client.on("guildCreate", guild => {
  console.log(`Bot entrou em um novo servidor: ${guild.name}.`);

  if (client.guilds.cache.size > 1) {
    guild.leave()
      .then(() => console.log(`Saiu do servidor ${guild.name}`))
      .catch(console.error);
  }
});

require("./handler__slash.js").run(client);
require("./handler__events.js").run(client);

client.once("ready", () => {
  console.log(`🟢 BOT ONLINE: ${client.user.tag}`);
  console.log(`🏠 Servidores: ${client.guilds.cache.size}`);
  console.log(`📦 Comandos na memória: ${client.slashCommands.size}`);
});

client.login(token);

process.on("multipleResolutions", (type, reason, promise) => {
  console.log("Err:", type, promise, reason);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Err:", reason, promise);
});

process.on("uncaughtException", (error, origin) => {
  console.log("Err:", error, origin);
});

process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.log("Err:", error, origin);
});
