import { TextChannel } from "discord.js";
import { Message } from "discord.js";
import { ffmpegBuffer } from "../../lib/ffmpeg/ffmpeg";
import { getFileExt, getFileName } from "../../lib/utils";
import { sendWebhook } from "../../lib/webhooks";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "hflip",
    name: "Horizontal Flip",
    desc: "Flips an image or video horizontally.",
    needs: ["image/video"],
    async execute(args: string[], buffers: [Buffer, string][], msg: Message) {
        return new Promise((res, rej) => {
            ffmpegBuffer(
                "-i $BUF0 -vf hflip $OUT",
                buffers,
                getFileExt(buffers[0][1])
            ).then((out: Buffer) => {
                sendWebhook(
                    "ffmpeg",
                    "",
                    msg.channel as TextChannel,
                    out,
                    getFileName("Effect_HFlip", getFileExt(buffers[0][1]))
                );
            }, handleFFmpegCatch(res));
        });
    },
} satisfies FlapsCommand;
