import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';

@Discord()
export class VolumeCommand {
	@Slash({ name: 'volume', description: 'Change the volume' })
	async setVolume(
		@SlashOption({
			name: 'volume',
			description: 'The volume you want to set',
			minValue: 0,
			maxValue: 100,
			required: true,
			type: ApplicationCommandOptionType.Integer
		})
		volume: number,
		interaction: CommandInteraction
	) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		cmd.queue.setVolume(volume);
		interaction.followUp({ content: `Volume set to ${volume}` });
	}
}