import { Track } from '@discordx/music';
import { User } from 'discord.js';

export interface CustomTrack extends Track {
  duration: number;
  thumbnail?: string;
  title: string;
  user: User;
}