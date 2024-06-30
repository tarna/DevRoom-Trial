import { importx } from '@discordx/importer';
import { IntentsBitField, Interaction } from 'discord.js';
import { Client } from 'discordx';
import { config } from './config';
import { musicPlayerManager } from './manager/MusicManager';
import { Node, QueueManager } from '@discordx/music';

export const client = new Client({
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.GuildVoiceStates,
	],
	silent: false,
});


client.once('ready', async () => {
	await client.guilds.fetch();
	await client.initApplicationCommands();
	const node = new Node(client);
	musicPlayerManager.instance = new QueueManager(node);
	console.log(`Logged in as ${client.user?.tag}!`)
});

client.on('interactionCreate', async (interaction: Interaction) => {
	if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('discordx@pagination@')) return;
	try {
		await client.executeInteraction(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.isRepliable()) {
			await interaction.reply({ content: 'There was an error while executing this interaction!', ephemeral: true });
		}
	}
});

async function run() {
	await importx(__dirname + '/{events,commands}/**/*.{ts,js}');

	const token = config.token;
	if (!token) {
		throw Error("Could not find BOT_TOKEN in your environment");
	}

	await client.login(token);
}

run();