const fs = require("fs");
const path = require("path");

module.exports = {
  run: (client) => {
    const root = __dirname;
    const arquivos = fs.readdirSync(root)
      .filter(f => f.startsWith("cmd__") && f.endsWith(".js"));

    const SlashsArray = [];
    console.log(`🔎 Procurando comandos na raiz: ${arquivos.length} arquivo(s) encontrado(s).`);

    for (const file of arquivos) {
      try {
        const comando = require(path.join(root, file));

        if (!comando || !comando.name || typeof comando.run !== "function") {
          console.error(`⚠️ Comando ignorado (formato inválido): ${file}`);
          continue;
        }

        client.slashCommands.set(comando.name, comando);
        SlashsArray.push(comando);
        console.log(`✅ Comando carregado: /${comando.name}`);
      } catch (error) {
        console.error(`❌ Falha ao carregar comando ${file}:`, error);
      }
    }

    console.log(`📦 Total de comandos carregados: ${SlashsArray.length}`);

    client.once("ready", async () => {
      try {
        const guildId = process.env.DISCORD_GUILD_ID || process.env.GUILD_ID;

        if (guildId) {
          const guild = await client.guilds.fetch(guildId);
          await guild.commands.set(SlashsArray);
          console.log(`✅ ${SlashsArray.length} comando(s) sincronizado(s) no servidor ${guild.name} (${guild.id}).`);
        } else {
          await client.application.commands.set(SlashsArray);
          console.log(`✅ ${SlashsArray.length} comando(s) globais sincronizado(s).`);
        }
      } catch (error) {
        console.error("❌ Falha ao sincronizar comandos:", error);
      }
    });
  }
};
