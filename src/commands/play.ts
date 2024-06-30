import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { musicPlayerManager } from '../manager/MusicManager';
import YouTube from 'youtube-sr';
import { CustomTrack } from '../types';
import { fromMS } from '../utils/functions';

@Discord()
export class PlayCommand {
	@Slash({ name: 'play', description: 'Play a song' })
	async play(
		@SlashOption({
			name: 'input',
			description: 'The song you want to play',
			required: true,
			type: ApplicationCommandOptionType.String
		})
		input: string,
		interaction: CommandInteraction
	) {
		const cmd = await musicPlayerManager.parseCommand(interaction);
		if (!cmd) return;

		clearTimeout(cmd.autoDeleteTimer);
		const { queue, member } = cmd;

		const video = await YouTube.searchOne(input).catch(() => null);
		if (!video) {
			return interaction.reply({ content: 'No results found!', ephemeral: true });
		}

		const track: CustomTrack = {
			duration: video.duration,
			thumbnail: video.thumbnail.url,
			title: video.title ?? 'Unknown',
			url: video.url,
			user: member.user,
		};

		queue.addTrack(track);

		const embed = new EmbedBuilder()
			.setTitle('Added to queue')
			.setDescription(`[${track.title}](${track.url}) (${fromMS(track.duration)})`);

		if (track.thumbnail) embed.setThumbnail(track.thumbnail);

		await interaction.followUp({ embeds: [embed] });
		if (!queue.isPlaying) queue.playNext();
	}
}