import { Queue, RepeatMode } from '@discordx/music';
import { CustomTrack } from '../types';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, MessageActionRowComponentBuilder, TextBasedChannel } from 'discord.js';
import { deleteMessage, fromMS } from '../utils/functions';

export class MusicQueue extends Queue<CustomTrack> {
	private _channel: TextBasedChannel | null = null;
	private _controlTimer: NodeJS.Timeout | null = null;

	private lastControlMessage?: Message;
	private lockUpdate = false;

	public setChannel(channel: TextBasedChannel) {
		this._channel = channel;
	}

	private controlsRow(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
		const nextButton = new ButtonBuilder()
			.setLabel("Next")
			.setEmoji("⏭")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(!this.isPlaying)
			.setCustomId("btn-next");

		const pauseButton = new ButtonBuilder()
			.setLabel(this.isPlaying ? "Pause" : "Resume")
			.setEmoji(this.isPlaying ? "⏸️" : "▶️")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("btn-pause");

		const stopButton = new ButtonBuilder()
			.setLabel("Stop")
			.setStyle(ButtonStyle.Danger)
			.setCustomId("btn-leave");

		const repeatButton = new ButtonBuilder()
			.setLabel("Repeat")
			.setEmoji("🔂")
			.setDisabled(!this.isPlaying)
			.setStyle(
				this.repeatMode === RepeatMode.REPEAT_ALL
				? ButtonStyle.Danger
				: ButtonStyle.Primary,
			)
			.setCustomId("btn-repeat");

		const loopButton = new ButtonBuilder()
			.setLabel("Loop")
			.setEmoji("🔁")
			.setDisabled(!this.isPlaying)
			.setStyle(
				this.repeatMode === RepeatMode.REPEAT_ONE
				? ButtonStyle.Danger
				: ButtonStyle.Primary,
			)
			.setCustomId("btn-loop");

		const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			stopButton,
			pauseButton,
			nextButton,
			repeatButton,
			loopButton,
		);

		const queueButton = new ButtonBuilder()
			.setLabel("Queue")
			.setEmoji("🎵")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("btn-queue");

		const mixButton = new ButtonBuilder()
			.setLabel("Shuffle")
			.setEmoji("🎛️")
			.setDisabled(!this.isPlaying)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("btn-mix");

		const controlsButton = new ButtonBuilder()
			.setLabel("Controls")
			.setEmoji("🔄")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("btn-controls");

		const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			queueButton,
			mixButton,
			controlsButton,
		);

		return [row1, row2];
	}

	public async updateControlMessage(options?: {
		force?: boolean;
		text?: string;
	}) {
		if (this.lockUpdate || this._channel === null) {
			return;
		}

		this.lockUpdate = true;
		const embed = new EmbedBuilder();
		embed.setTitle("Music Controls");
		const currentTrack = this.currentPlaybackTrack;
		const nextTrack = this.nextTrack;

		if (!currentTrack) {
			if (this.lastControlMessage) {
				await deleteMessage(this.lastControlMessage);
				this.lastControlMessage = undefined;
			}
			this.lockUpdate = false;
			return;
		}

		const user = currentTrack.user;
		embed.addFields({
			name: `Now Playing${
				this.queueSize > 2
				? `(Total: ${String(this.queueSize)} tracks queued)`
				: ""
			}`,
			value: `[${currentTrack.title}](${currentTrack.url}) by ${user.toString()}`,
		});

		const progressBarOptions = {
			arrow: "🔘",
			block: "━",
			size: 15,
		};

		const { size, arrow, block } = progressBarOptions;
		const timeNow = this.playbackInfo?.playbackDuration ?? 0;
		const timeTotal = currentTrack.duration;

		const progress = Math.round((size * timeNow) / timeTotal);
		const emptyProgress = size - progress;

		const progressString =
		block.repeat(progress) + arrow + block.repeat(emptyProgress);

		const bar = `${this.isPlaying ? "▶️" : "⏸️"} ${progressString}`;
		const currentTime = fromMS(timeNow);
		const endTime = fromMS(timeTotal);
		const spacing = bar.length - currentTime.length - endTime.length;
		const time = `\`${currentTime}${" ".repeat(spacing * 3 - 2)}${endTime}\``;
		embed.addFields({ name: bar, value: time });

		if (currentTrack.thumbnail) {
			embed.setThumbnail(currentTrack.thumbnail);
		}

		embed.addFields({
			name: "Next Song",
			value: nextTrack
				? `[${nextTrack.title}](${nextTrack.url})`
				: "No upcoming song",
		});

		const pMsg = {
			components: [...this.controlsRow()],
			content: options?.text,
			embeds: [embed],
		};

		if (!options?.force && this.lastControlMessage) {
			// Update control message
			await this.lastControlMessage.edit(pMsg);
		} else {
			// Delete control message
			if (this.lastControlMessage) {
				await deleteMessage(this.lastControlMessage);
				this.lastControlMessage = undefined;
			}

			// Send control message
			this.lastControlMessage = await this._channel.send(pMsg);
		}

		this.lockUpdate = false;
	}

	public startControlUpdate(interval?: number) {
		this.stopControlUpdate();

		this._controlTimer = setInterval(() => {
			this.updateControlMessage();
		}, interval ?? 10_000);

		this.updateControlMessage();
	}

	public stopControlUpdate() {
		if (this._controlTimer) {
		clearInterval(this._controlTimer);
		this._controlTimer = null;
		}

		if (this.lastControlMessage) {
		deleteMessage(this.lastControlMessage);
		this.lastControlMessage = undefined;
		}

		this.lockUpdate = false;
	}

	public loop() {
		if (this.repeatMode === RepeatMode.OFF) {
			this.setRepeatMode(RepeatMode.REPEAT_ALL);
		} else {
			this.setRepeatMode(RepeatMode.OFF);
		}
	}

	public exit() {
		this.stopControlUpdate();
		super.exit();
	}
}