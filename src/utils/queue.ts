import { ButtonInteraction, CommandInteraction, Message } from 'discord.js';
import { MusicQueue } from '../manager/MusicQueue';
import { deleteMessage, fromMS } from './functions';
import { Pagination, PaginationResolver, PaginationType } from '@discordx/pagination';

export async function showQueue(queue: MusicQueue, interaction: CommandInteraction | ButtonInteraction) {
	const currentTrack = queue.currentPlaybackTrack;
	if (!currentTrack) {
	  const pMsg = await interaction.followUp({
		content: "> could not process queue atm, try later!",
		ephemeral: true,
	  });
	  if (pMsg instanceof Message) {
		setTimeout(() => deleteMessage(pMsg), 3000);
	  }
	  return;
	}
  
	if (!queue.queueSize) {
	  const pMsg = await interaction.followUp({
		content: `> Playing **${currentTrack.title}**`,
		embeds: currentTrack.thumbnail
		  ? [{ image: { url: currentTrack.thumbnail } }]
		  : [],
	  });
  
	  if (pMsg instanceof Message) {
		setTimeout(() => deleteMessage(pMsg), 1e4);
	  }
	  return;
	}
  
	const current = `> Playing **${currentTrack.title}** out of ${String(
	  queue.queueSize + 1,
	)}`;
  
	const pageOptions = new PaginationResolver(
	  (index, paginator) => {
		paginator.maxLength = queue.queueSize / 10;
		if (index > paginator.maxLength) {
		  paginator.currentPage = 0;
		}
  
		const currentPage = paginator.currentPage;
  
		const tracks = queue.tracks
		  .slice(currentPage * 10, currentPage * 10 + 10)
		  .map(
			(track, index1) =>
			  `${String(currentPage * 10 + index1 + 1)}. ${track.title}` +
			  ` (${fromMS(track.duration)})`,
		  )
		  .join("\n\n");
  
		return { content: `${current}\n\`\`\`markdown\n${tracks}\`\`\`` };
	  },
	  Math.floor(queue.queueSize / 10),
	);
  
	await new Pagination(interaction, pageOptions, {
	  enableExit: true,
	  onTimeout: (index, message) => {
		deleteMessage(message);
	  },
	  time: 6e4,
	  type:
		Math.floor(queue.queueSize / 10) <= 5
		  ? PaginationType.Button
		  : PaginationType.SelectMenu,
	}).send();
  }