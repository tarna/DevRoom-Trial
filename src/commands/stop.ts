import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';

@Discord()
export class StopCommand {
	@Slash({ name: 'stop', description: 'Stop the music' })
	async stop(interaction: CommandInteraction) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		cmd.queue.exit();
		interaction.followUp({ content: 'Music stopped, leaving voice channel' });
	}
}