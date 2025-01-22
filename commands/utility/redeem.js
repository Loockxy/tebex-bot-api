const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { bot, api } = require('../../config')
// const purchaseDB = require('../../config/purchase')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Récupérer son role depuis sont id de transaction')
        .addStringOption(option => 
            option.setName('transaction_id')
            .setDescription('ID de la transaction')
            .setRequired(true)
        ),
	async execute(interaction) {
		await interaction.deferReply({ephemeral: true});

        // let purchase = purchaseDB.findOne({ transaction_id: interaction.options.getString("transaction_id") });
        let purchase = await interaction.db.purchase.findOne({ transaction_id: interaction.options.getString("transaction_id") });
        if(purchase) {
            if(purchase.used) return interaction.followUp("Cette ID de transaction à déjà été utiliser");
            if(api.client) interaction.client.guilds.cache.get(bot.guildId).members.cache.get(interaction.user.id).roles.add(api.client)
            purchase.products.forEach(product => {
                if(api.products[product.id]) interaction.client.guilds.cache.get(bot.guildId).members.cache.get(interaction.user.id).roles.add(api.products[product.id])
            })
            purchase.discord_id = interaction.user.id;
            purchase.used = true;
            await purchase.save().then(() => {
                let tbx = purchase;

                let embed = new EmbedBuilder()
                .setTitle("Récupération du role pour la transaction `" + interaction.options.getString('transaction_id') + "`")
                .setDescription(`> **Utilisateur:** \`${tbx.firstname} ${tbx.lastname}\`\n> **Discord ID:** \`${tbx.discord_id ? tbx.discord_id : "undefined"}\` <@${tbx.discord_id ? tbx.discord_id : "undefined"}>\n> **FiveM:** \`${tbx.fivem.name}\` ${tbx.fivem.id}\n> **Transaction ID:** \`${tbx.transaction_id}\`\n> **Nombre de produits:** \`${tbx.products.length}x\`\n> **Produits acheté(s):** \`${tbx.products.map(item => item.name).join(", ")}\`\n> **Prix total:** \`${tbx.price}\`\n> **Méthode de payement:** \`${tbx.payment_method}\``)
                .setTimestamp()
                interaction.client.channels.cache.get(api.channels.logs).send({content: ``, embeds: [embed]});

                interaction.followUp(`Vous avez récupéré votre role avec succès`);
            });
        } else return interaction.followUp("Cette ID de transaction n'est pas dans la base de donnée")
	},
};