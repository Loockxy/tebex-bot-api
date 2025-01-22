const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transaction')
		.setDescription("Avoir les informations d'une transaction")
        .addSubcommand(command => 
            command.setName("info")
            .setDescription("Obtenir les informations d'une transaction")
            .addStringOption(option =>
                option.setName('transaction_id')
                .setDescription('ID de la transaction')
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
      await interaction.deferReply();

		if(interaction.options.getSubcommand() === 'info') {
         let db = interaction.db;

         let tbx = await db.purchase.findOne({ transaction_id: interaction.options.getString('transaction_id') });

         if(!tbx) return interaction.followUp({ content: 'Cette ID de transaction n\'existe pas dans la base de donnée' });
      
         let embed = new EmbedBuilder()
         .setTitle("Information sur l'ID de transaction : `" + interaction.options.getString('transaction_id') + "`")
         .setDescription(`> **Utilisateur:** \`${tbx.firstname} ${tbx.lastname}\`\n> **Discord ID:** \`${tbx.discord_id ? tbx.discord_id : "undefined"}\` <@${tbx.discord_id ? tbx.discord_id : "undefined"}>\n> **FiveM:** \`${tbx.fivem.name}\` ${tbx.fivem.id}\n> **Transaction ID:** \`${tbx.transaction_id}\`\n> **Nombre de produits:** \`${tbx.products.length}x\`\n> **Produits acheté(s):** \`${tbx.products.map(item => item.name).join(", ")}\`\n> **Prix total:** \`${tbx.price}\`\n> **Méthode de payement:** \`${tbx.payment_method}\``)
         .setTimestamp()

         interaction.followUp({ embeds: [embed] });
      }
	},
};