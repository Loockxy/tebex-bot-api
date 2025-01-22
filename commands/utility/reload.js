const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { bot } = require('../../config')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

        if (!bot.owners.includes(interaction.user.id)) {
            return interaction.reply({
                content: "This command has for devs only.",
                ephemeral: true
            });
        }

		if (!command) {
			return interaction.reply({
                content: `There is no command with name \`${commandName}\`!`,
                ephemeral: true
            });
		}

        delete require.cache[require.resolve(`./${command.data.name}.js`)];

        try {
            const newCommand = require(`./${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
        } catch (error) {
            console.error(error);
            await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
        }
	},
};