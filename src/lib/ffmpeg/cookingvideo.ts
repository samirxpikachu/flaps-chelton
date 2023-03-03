import { ffmpegBuffer, file, preset } from "./ffmpeg";
import { getFrameCount, getVideoLength } from "./getVideoDimensions";

export async function cookingVideo(buffers: [Buffer, string][]) {
    var n_frames = await getFrameCount(file("cooking.mp4"));
    var len = await getVideoLength(file("cooking.mp4"));
    var start_frame = Math.round(n_frames * 0.4);
    var frames_length = Math.round(n_frames * 0.075);
    var fade_time = Math.round(n_frames * 0.05);
    var end_frame = start_frame + frames_length;

    return ffmpegBuffer(
        `-loop 1 -t ${len} -i $BUF0 -i ${file(
            "cooking.mp4"
        )} -filter_complex "[0:v]scale=576:1024,setsar=1:1,fade=in:${start_frame}:${fade_time}:alpha=1,fade=out:${end_frame}:${fade_time}:alpha=1[fader];[1:v][fader]overlay[final]" -shortest -map "[final]" -map "1:a:0" -preset:v ${preset} $OUT`,
        buffers,
        "mp4"
    );
}
