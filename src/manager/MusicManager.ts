import { ButtonInteraction, CommandInteraction, Guild, GuildMember, TextBasedChannel } from 'discord.js';
import { MusicQueue } from './MusicQueue';
import { QueueManager } from '@discordx/music';

export interface ParsedCommand {
  autoDeleteTimer: NodeJS.Timeout;
  channel: TextBasedChannel;
  guild: Guild;
  member: GuildMember;
  queue: MusicQueue;
}

export class MusicPlayerManager {
  instance: QueueManager | null = null;
  queueStore = new Map<string, MusicQueue>();
  COMMAND_INTERACTION_DELETE_DELAY = 60_000;
  BUTTON_INTERACTION_DELETE_DELAY = 3_000;

  delete(interaction: CommandInteraction | ButtonInteraction) {
    const isButton = interaction.isButton();
    const delay = isButton
      ? this.BUTTON_INTERACTION_DELETE_DELAY
      : this.COMMAND_INTERACTION_DELETE_DELAY;

    return setTimeout(() => {
      interaction.deleteReply();
    }, delay);
  }

  getQueue(guildId: string): MusicQueue | null {
    if (!this.instance) {
      return null;
    }

    const { node } = this.instance;
    return this.instance.queue(guildId, () => new MusicQueue(node, guildId));
  }

  async parseCommand(
    interaction: CommandInteraction | ButtonInteraction,
  ): Promise<ParsedCommand | null> {
    await interaction.deferReply();
    const autoDeleteTimer = this.delete(interaction);

    if (
      !interaction.channel ||
      !(interaction.member instanceof GuildMember) ||
      !interaction.guild
    ) {
      await interaction.followUp({
        content: "The command could not be processed. Please try again",
      });
      return null;
    }

    if (!interaction.member.voice.channelId) {
      await interaction.followUp({
        content: "Join a voice channel first",
      });
      return null;
    }

    const bot = interaction.guild.members.cache.get(interaction.client.user.id);

    if (!bot) {
      await interaction.followUp({
        content: "Having difficulty finding my place in this world",
      });
      return null;
    }

    const queue = this.getQueue(interaction.guild.id);

    if (!queue) {
      await interaction.followUp({
        content: "The player is not ready yet, please wait",
      });
      return null;
    }

    if (bot.voice.channelId === null) {
      queue.setChannel(interaction.channel);
      queue.join({
        channelId: interaction.member.voice.channelId,
      });
    } else if (interaction.member.voice.channelId !== bot.voice.channelId) {
      await interaction.followUp({
        content: "join to my voice channel",
      });
      return null;
    }

    return {
      autoDeleteTimer,
      channel: interaction.channel,
      guild: interaction.guild,
      member: interaction.member,
      queue,
    };
  }
}

export const musicPlayerManager = new MusicPlayerManager();