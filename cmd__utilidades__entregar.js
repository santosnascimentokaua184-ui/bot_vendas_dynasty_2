const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Attachment, AttachmentBuilder} = require("discord.js")
const { JsonDatabase } = require("wio.db")
const dbe = new JsonDatabase({ databasePath: "./data__emojis.json"})
const dbc = new JsonDatabase({ databasePath: "./data__botconfig.json"})
const dbp = new JsonDatabase({ databasePath: "./data__perms.json"})
const db = new JsonDatabase({ databasePath: "./data__produtos.json"})
const fs = require("fs")
const Discord = require("discord.js")
const { updateEspecifico } = require("./fn__UpdateMessageBuy.js")

module.exports = {
    name: "delivery", 
    description: "📦🤖| Envie alguns produtos para alguém.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "produto",
            description: "Escolha um produto.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: "quantidade",
            description: "Escreva a quantidade de produtos que será enviada.",
            type: Discord.ApplicationCommandOptionType.Number,
            required: true,
            autocomplete: false,
        },
        {
            name: "usuario",
            description: "Selecione o usuário que receberá o(s) produto(s).",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
            autocomplete: false,
        },
    ],
    async autocomplete(interaction) {
        try {
            const value = interaction.options.getFocused().toLowerCase();
            let pds = [];
    
            // Obtém todos os produtos do banco de dados
            const entries = await db.all();  // Async operação, use await
    
            entries.forEach(entry => {
                const painelId = entry.data?.id; // Verificação se entry.data existe
                const produtos = entry.data?.produtos; // Verificação se produtos existem
                if (produtos && Array.isArray(produtos)) {  // Verifica se é um array
                    produtos.forEach(produto => {
                        pds.push({ ...produto, painelId });
                    });
                }
            });
    
            // Filtra os produtos com base no nome e no valor da interação
            const filtered = pds
                .filter(produto => produto.nome.toLowerCase().includes(value))
                .slice(0, 25); // Limite de 25 produtos para evitar sobrecarga
    
            if (!interaction) return;
    
            if (pds.length === 0) {
                await interaction.respond([
                    { name: "Nenhum produto foi criado!", value: "sem_produtos" }
                ]);
            } else if (filtered.length === 0) {
                await interaction.respond([
                    { name: "Não Achei Nenhum produto", value: "nenhum_produto" }
                ]);
            } else {
                await interaction.respond(
                    filtered.map(choice => ({
                        name: `⚡- Painel: ${choice.painelId} | 🪪 - Nome: ${choice.nome} | 📦 - Estoque: ${choice.estoque.length}`,
                        value: `${choice.painelId}_${choice.nome}`
                    }))
                );
            }
        } catch (error) {
            console.error('Erro ao carregar produtos: ', error);
            await interaction.respond([{ name: "Erro ao carregar produtos!", value: "erro_produtos" }]);
        }
    },
    
    
    run: async (client, interaction) => {
        interaction.deferReply({ flags: 64 })
        const produto = interaction.options.getString("produto");
        const painelId = produto.split("_")[0];
        const nome = produto.split("_")[1];
        const qtd = interaction.options.getNumber("quantidade");
        const user = interaction.options.getUser("usuario");
        
        if (interaction.user.id !== dbp.get(`${interaction.user.id}`)) {
            return interaction.editReply({ flags: 64, content: `${dbe.get(`13`)} | Você não tem permissão para usar este comando!` });
        }
        
        if (!interaction.guild.members.cache.get(user.id)) {
            return interaction.editReply({ flags: 64, content: `${dbe.get(`13`)} | Usuário não encontrado!` });
        }
        
        const produtoss = await db.get(`${painelId}.produtos`) || []
        const pd = produtoss.find(a => a.nome === nome) || []
        
        if (!pd) {
            return interaction.editReply({ flags: 64, content: `${dbe.get(`13`)} | Nenhum produto encontrado!` });
        }
        
        let estoque = pd.estoque || [];
        
        if (estoque.length < 1) {
            return interaction.editReply({ flags: 64, content: `${dbe.get(`13`)} | Este produto não tem estoque!` });
        }
        
        const nmrentregas = qtd;
        const produtos = pd.estoque.splice(0, nmrentregas);
        const total = produtos.reduce((acc, item) => acc + item.length, 0);
        db.set(`${painelId}.produtos`, produtoss);
        
        let filed = `./entrega-${user.id}.txt`;
        let txt = false
        let faltou = false;
        let quantos = 0;
        
        if (produtos.length < nmrentregas) {
            faltou = true;
            quantos = nmrentregas - produtos.length;
            while (produtos.length < nmrentregas) {
                produtos.push("Faltou Produto! Peça reembolso para o adm!");
            }
        }
        if (produtos.length <= 5 && total < 1500) {
            filed = `${produtos.map((produto, index) => `${produto}`).join('\n')}`;
        } else {
            txt = true
            fs.writeFileSync(filed, `${produtos.join('\n')}`);
        }
        
        const embedVenda = new EmbedBuilder()
            .setAuthor({ name: `✅ Entrega Feita!`, iconURL: user.displayAvatarURL({}) })
            .setColor(dbc.get(`color`))
            .addFields(
                { name: `Produto's enviado's por:`, value: `${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`, inline: true },
                { name: `Produto's:`, value: `${pd.nome} \`x${nmrentregas}\``, inline: true },
                { name: `Data / Horário:`, value: `<t:${Math.floor(new Date() / 1000)}:f>`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({}));

        const embedVendaStaff = new EmbedBuilder()
            .setAuthor({ name: `✅ Solicitação de Entrega Concluida!`, iconURL: user.displayAvatarURL({}) })
            .setColor("Green")
            .addFields(
                { name: `Autor da solicitação:`, value: `${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`, inline: true },
                { name: `Usuário que recebeu:`, value: `${user} (\`${user.username} - ${user.id}\`)`, inline: true },
                { name: `Produto Enviado:`, value: `${pd.nome} \`x${nmrentregas}\``, inline: true },
                { name: `Data / Horário:`, value: `<t:${Math.floor(new Date() / 1000)}:f>`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({}));
        
        const embedProdutos = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: `📦 Produto's recebido's:`, iconURL: user.displayAvatarURL({}) })
            .setTimestamp()
            .setDescription(txt === false ? `\`\`\`${filed}\`\`\`` : `**Todos os produtos estão em um arquivo abaixo.**`)
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({}) })
        
        const logspriv = interaction.guild.channels.cache.get(dbc.get(`canais.vendas_privado`));
        if (user) {
            await user.send({ embeds: [embedVenda, embedProdutos] });
            if (produtos.length > 5 || total > 1500) {
                await user.send({ files: [filed] });
            }
        }
        if (logspriv) {
            await logspriv.send({ embeds: [embedVendaStaff, embedProdutos] });
            if (produtos.length > 5 || total > 1500) {
                await logspriv.send({ files: [filed] });
            }
        }
        if (produtos.length > 5 || total > 1500) {
            fs.unlink(filed, (err) => {
                if (err) {
                    console.error('Erro ao apagar o arquivo:', err);
                } else {
                }
            });
        }
        interaction.editReply({ content: `${dbe.get(`6`)} | Delivery entregue!`, flags: 64})
        

        updateEspecifico(interaction, painelId)
    }
};
