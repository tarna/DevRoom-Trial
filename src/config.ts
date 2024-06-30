import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

export const config = {
	token: process.env.DISCORD_TOKEN as string
}