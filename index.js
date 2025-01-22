const { api, bot } = require('./config');

let db = {
    purchase: require('./models/purchase'),
}

const axios = require('axios');
const crypto = require('crypto');
const Discord = require('discord.js');
const intents = new Discord.IntentsBitField(53608447);
const client = new Discord.Client({partials: ["CHANNEL"], intents: intents});
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json({ 
    limit: '2048mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));

app.use((req, res, next) => {
    next();
});


require('./mongo')();

app.post("/tebex/webhook", async (req, res) => {
	if(req.headers['user-agent'] !== 'TebexWebhook') return res.status(403).send('Unauthorized');

    const signature = req.headers['x-signature'];
    const body = await req.rawBody;

    const bodyHash = crypto
        .createHash('sha256')
        .update(req.rawBody.toString(), 'utf-8')
        .digest('hex');
    const finalHash = crypto.createHmac('sha256', api.secret)
        .update(bodyHash)
        .digest('hex');
        
    if (finalHash !== signature) {
        console.log('finalHash', finalHash);
        console.log('signature', signature);
        return res.status(403).send('Unauthorized');
    }
    
    const data = JSON.parse(body);

    if(data.type === "payment.completed") {
		let tbx = await db.purchase.findOne({ transaction_id: data.subject.transaction_id });

		if(!tbx) {
			let dsc = "undefined"
			tbx = new db.purchase({ transaction_id: data.subject.transaction_id });
			tbx.fivem = {
				id: data.subject.customer.username.id,
                name: data.subject.customer.username.username,
			}
			tbx.firstname = data.subject.customer.first_name
			tbx.lastname = data.subject.customer.last_name
			tbx.price = `${data.subject.price.amount} ${data.subject.price.currency}`
			tbx.payment_method = data.subject.payment_method.name
			tbx.email = data.subject.customer.email
			tbx.ip = data.subject.customer.ip
			tbx.products = data.subject.products
			if(data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id")) {
				tbx.used = true
				if(data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option) tbx.discord_id = data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option
				if(dsc === "undefined" && data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option) dsc = data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option
			} else {
				tbx.used = false
			} 
			tbx.createdAt = data.subject.created_at
            await tbx.save().then(() => {
				if(client.guilds.cache.get(bot.guildId).members.cache.get(data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id"))) {
					client.guilds.cache.get(bot.guildId).members.cache.get(data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option).roles.add(api.client)
					data.subject.products.map(item => item.id).forEach(product => {
						client.guilds.cache.get(bot.guildId).members.cache.get(data.subject.products.flatMap(product => product.variables).find(variable => variable.identifier === "discord_id").option).roles.add(api.products[product])
					})
				}
				const embed = new Discord.EmbedBuilder()
				.setTitle("Nouveau logs reçu")
				.setDescription(`> **Utilisateur:** \`${data.subject.customer.first_name} ${data.subject.customer.last_name}\`\n> **Discord ID:** \`${dsc}\` <@${dsc}>\n> **FiveM:** \`${data.subject.customer.username.username}\` ${data.subject.customer.username.id}\n> **Transaction ID:** \`${data.subject.transaction_id}\`\n> **Nombre de produits:** \`${data.subject.products.length}x\`\n> **Produits acheté(s):** \`${data.subject.products.map(item => item.name).join(", ")}\`\n> **Prix total:** \`${data.subject.price.amount} ${data.subject.price.currency}\`\n> **Méthode de payement:** \`${data.subject.payment_method.name}\``)
				.setColor("#00ff00")
				.setTimestamp()
				
				const FiveMProfile = new Discord.ButtonBuilder()
				.setLabel('FiveM Profile')
				.setURL(`https://forum.cfx.re/u/${data.subject.customer.username.username}/summary`)
				.setStyle(Discord.ButtonStyle.Link);

				const row = new Discord.ActionRowBuilder()
				.addComponents(FiveMProfile);

				client.channels.cache.get(api.channels.logs).send({content: ``, embeds: [embed], components: [row]});
			})
		} else if(data.type === "validation.webhook") {
			if(api.channels.logs) client.channels.cache.get(api.channels.logs).send({content: `Configuration réussi !`});
		}
    }
    
    res.status(200).send(body);	
})

app.listen(api.port, () => console.log(`The API server listening on ${api.port}`))

client.commands = new Discord.Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new Discord.REST().setToken(bot.token);

(async () => {
	try {
		console.log(`Started refreshing ${client.commands.size} application (/) commands.`);

		const commands = client.commands.map(command => command.data.toJSON());
        const data = await rest.put(
            Discord.Routes.applicationGuildCommands(bot.clientId, bot.guildId),
            { body: commands },
        );


		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on("ready", async () => {
    console.log(`Connection du bot ${client.user.tag} effectuer avec success`);

    client.user.setPresence({ activities: [{ name: bot.status, type: Discord.ActivityType.Streaming, url: 'https://twitch.tv/tb_loockxy' }], status: 'online' });
})

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

    interaction.db = db;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: Discord.MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: Discord.MessageFlags.Ephemeral });
		}
	}
});

client.on("guildMemberAdd", async (member) => {
	if (member.guild.id !== bot.guildId) return;

    let tbx = await db.purchase.find({ discord_id: member.user.id });
	if(!tbx) return;
	
	tbx.forEach(purchase => {
		purchase.products.forEach(product => {
			if(api.client) member.roles.add(api.client);
			if(api.products[product.id]) member.roles.add(api.products[product.id]);
		});
	});
});

client.login(bot.token);