const fs = require("fs");
const path = require("path");

module.exports = {
  run: (client) => {
    const root = __dirname;
    const arquivos = fs.readdirSync(root)
      .filter(f => f.startsWith("event__") && f.endsWith(".js"));

    let carregados = 0;
    console.log(`🔎 Procurando eventos na raiz: ${arquivos.length} arquivo(s) encontrado(s).`);

    for (const file of arquivos) {
      try {
        const event = require(path.join(root, file));

        if (!event || !event.name || typeof event.run !== "function") {
          console.error(`⚠️ Evento ignorado (formato inválido): ${file}`);
          continue;
        }

        const listener = (...args) => event.run(...args, client);

        if (event.once) {
          client.once(event.name, listener);
        } else {
          client.on(event.name, listener);
        }

        carregados++;
        console.log(`✅ Evento carregado: ${event.name} ← ${file}`);
      } catch (error) {
        console.error(`❌ Falha ao carregar evento ${file}:`, error);
      }
    }

    console.log(`📦 Total de eventos carregados: ${carregados}`);
  }
};
