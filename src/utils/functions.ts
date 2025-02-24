import { Message } from 'discord.js';

export async function deleteMessage(message: Message) {
	if (!message.deletable) return null;
	return await message.delete().catch(() => null);
}

export function fromMS(duration: number) {
	const seconds = Math.floor((duration / 1e3) % 60);
	const minutes = Math.floor((duration / 6e4) % 60);
	const hours = Math.floor(duration / 36e5);
	const secondsPad = seconds.toString().padStart(2, "0");
	const minutesPad = minutes.toString().padStart(2, "0");
	const hoursPad = hours.toString().padStart(2, "0");
	return `${hours ? `${hoursPad}:` : ""}${minutesPad}:${secondsPad}`;
  }
  
export function toMS(duration: string) {
	const reducer = (prev: number, curr: string, i: number, arr: string[]) => {
	  return prev + parseInt(curr) * Math.pow(60, arr.length - 1 - i);
	};
  
	const seconds = duration.split(":").reduceRight(reducer, 0);
	const milliseconds = seconds * 1e3;
	return milliseconds;
}