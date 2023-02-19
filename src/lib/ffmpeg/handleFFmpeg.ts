import { TextBasedChannel, TextChannel } from "discord.js";
import { getFileName } from "../utils";
import { sendWebhook } from "../webhooks";

export default function handleFFmpeg(
    filename: string,
    channel: TextBasedChannel
): (buffer: Buffer) => void {
    return function handler(buffer: Buffer) {
        sendWebhook("ffmpeg", "", channel, buffer, filename);
    };
}
