import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import imgfade from "../../lib/ffmpeg/imgfade";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "imgfade",
    name: "Image Fade",
    desc: "Fades an image onto a video.",
    needs: ["video", "image/video"],
    execute(args, buf, msg) {
        return new Promise((res, rej) => {
            imgfade(buf).then(
                handleFFmpeg(
                    getFileName("Effect_Invert", getFileExt(buf[0][1])),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
