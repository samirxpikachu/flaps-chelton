import { ffmpegBuffer, file } from "./ffmpeg";

export default function gameplay(
    buffers: [Buffer, string][],
    highres: boolean
) {
    return ffmpegBuffer(
        `-loop 1 -i $BUF0 -i ${file(
            "gameplay.mp3"
        )} -/filter_complex ./ffscripts/gameplay${
            highres ? "" : "_lowres"
        }.ffscript -sws_flags fast_bilinear -t 29 -map "[out_v]" -map "[out_a]" $PRESET $OUT`,
        buffers,
        "mp4",
        true
    );
}
