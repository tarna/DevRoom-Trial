import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';

@Discord()
export class SkipCommand {
	@Slash({ name: 'skip', description: 'Skip the current song' })
	async skip(interaction: CommandInteraction) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		const { queue } = cmd;
		const current = queue.currentPlaybackTrack;
		if (!current) {
			return interaction.followUp({ content: 'There is no song playing' });
		}

		const next = queue.playNext();
		if (!next) {
			queue.exit();
			return interaction.followUp({ content: 'No more songs in the queue' });
		}

		interaction.followUp({ content: `Skipped: **${current.title}**` });
	}
}