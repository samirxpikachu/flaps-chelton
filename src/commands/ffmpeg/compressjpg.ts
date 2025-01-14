import { TextChannel } from "discord.js";
import handleFFmpeg from "../../lib/ffmpeg/handleFFmpeg";
import compressjpg from "../../lib/ffmpeg/compressjpg";
import { getFileExt, getFileName } from "../../lib/utils";
import { FlapsCommand } from "../../types";
import handleFFmpegCatch from "../../lib/ffmpeg/handleFFmpegCatch";

module.exports = {
    id: "compressjpg",
    name: "Compress JPG",
    desc: "Compresses an image a comical amount.",
    aliases: ["compressjpeg", "jpgcompress", "jpegcompress"],
    needs: ["image"],
    async execute(args, buf, msg) {
        return new Promise((res, rej) => {
            compressjpg(buf).then(
                handleFFmpeg(
                    getFileName("Effect_CompressJPG", "jpeg"),

                    res
                ),
                handleFFmpegCatch(res)
            );
        });
    },
} satisfies FlapsCommand;
