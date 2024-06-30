import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';
import { showQueue } from '../utils/queue';

@Discord()
export class QueueCommand {
	@Slash({ name: 'queue', description: 'Show the queue' })
	async queue(interaction: CommandInteraction) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		clearTimeout(cmd.autoDeleteTimer);
		showQueue(cmd.queue, interaction);
	}
}