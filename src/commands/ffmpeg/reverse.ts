import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compress from "../../lib/ffmpeg/compress";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";
import reverse from "../../lib/ffmpeg/reverse";

module.exports = {
    id: "reverse",
    name: "Reverse",
    desc: "Reverses a video or audio file.",
    needs: ["video/audio"],
    execute(args, buf, msg) {
        reverse(buf).then(
            handleFFmpeg(
                getFileName("Effect_Reverse", getFileExt(buf[0][1])),
                msg.channel as TextChannel
            ),
            handleFFmpegCatch(msg.channel)
        );
    },
} satisfies FlapsCommand;
