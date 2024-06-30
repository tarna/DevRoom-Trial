import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';

@Discord()
export class SkipCommand {
	@Slash({ name: 'loop', description: 'loops a song' })
	async skip(interaction: CommandInteraction) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		const { queue } = cmd;
		
		queue.loop()

		interaction.followUp({ content: `Looped: **${queue.currentPlaybackTrack?.title}**` });
	}
}