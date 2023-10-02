import { lookup } from "mime-types";
import { bufferToDataURL } from "../utils";
import { hookWeb3DAPIAnimation } from "../web3dapi";
import { ffmpegBuffer } from "./ffmpeg";
import { addBufferSequence, removeBuffer } from "../..";
import crop from "./crop";

export default async function ecube(buffers: [Buffer, string][]) {
    let resolution = 512;

    let zoomRotateLength = 0.6;
    let zoomRotateOutput = await ffmpegBuffer(
        `-loop 1 -i $BUF0 -f lavfi -i "color=d=${zoomRotateLength}:s=${resolution}*${resolution}" -filter_complex "
[0:v]scale=${resolution}:${resolution},setsar=1:1[scaled];
[scaled]pad=w=1.5*iw:1.5*ih:x=-1:y=-1[padded];
[padded]rotate=max(pow((t-0.1)*2\\,3)\\,0)[rotating];
[rotating]scale=max(1-3*t+0.5\\,0.7)*iw:-1:eval=frame[scaling];
[1:v][scaling]overlay=x=main_w/2-overlay_w/2:y=main_h/2-overlay_h/2[out]" -map "[out]" -t 0.6 $PRESET $OUT`,
        buffers,
        "mp4"
    );

    let planeAnimation = await hookWeb3DAPIAnimation("ecube_2planes", {
        imageURL: bufferToDataURL(
            buffers[0][0],
            lookup(buffers[0][1]) || "image/png"
        ),
    });
    let planeAnimationFrames: Buffer[] = [];
    planeAnimationFrames.push(await planeAnimation.step(0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.3, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.2, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.1, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.1, 25));
    planeAnimationFrames.push(await planeAnimation.step(-0.1, 24.5));
    planeAnimationFrames.push(await planeAnimation.step(-0.1, 24));
    planeAnimationFrames.push(await planeAnimation.step(-0.05, 23.5));
    planeAnimationFrames.push(await planeAnimation.step(-0.03, 22));
    planeAnimationFrames.push(await planeAnimation.step(-0.03, 20.5));
    planeAnimationFrames.push(await planeAnimation.step(-0.03, 19));
    planeAnimationFrames.push(await planeAnimation.step(0, 17, true));
    planeAnimationFrames.push(await planeAnimation.step(0, 15));
    let planeAnimationSequence = addBufferSequence(
        planeAnimationFrames,
        "jpeg"
    );
    let planeAnimationConcat = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${planeAnimationSequence} -framerate 20 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(planeAnimationSequence);

    let heartAnimation = await hookWeb3DAPIAnimation("ecube_hearts", {
        imageURL: bufferToDataURL(
            buffers[0][0],
            lookup(buffers[0][1]) || "image/png"
        ),
    });
    let heartAnimationFrames: Buffer[] = [];
    heartAnimationFrames.push(await heartAnimation.step(0, 1.5));
    heartAnimationFrames.push(await heartAnimation.step(0, 1.4));
    heartAnimationFrames.push(await heartAnimation.step(0, 1.2));
    heartAnimationFrames.push(await heartAnimation.step(0, 0.8));
    heartAnimationFrames.push(await heartAnimation.step(0, 0.7));
    heartAnimationFrames.push(await heartAnimation.step(0, 0.6));
    heartAnimationFrames.push(await heartAnimation.step(0, 0.5));
    heartAnimationFrames.push(await heartAnimation.step(0.05, 0.3));
    heartAnimationFrames.push(await heartAnimation.step(0.1, 0.2));
    heartAnimationFrames.push(await heartAnimation.step(0.1, 0.15));
    heartAnimationFrames.push(await heartAnimation.step(0.15, 0.1));
    heartAnimationFrames.push(await heartAnimation.step(0.2, 0.05));
    heartAnimationFrames.push(await heartAnimation.step(0.3, 0));
    heartAnimationFrames.push(await heartAnimation.step(0.4, 0));
    heartAnimationFrames.push(await heartAnimation.step(0.5, 0));
    heartAnimationFrames.push(await heartAnimation.step(0.64, 0));
    heartAnimationFrames.push(await heartAnimation.step(0.88, 0));
    heartAnimationFrames.push(await heartAnimation.step(1.1, 0));
    heartAnimationFrames.push(await heartAnimation.step(1.3, 0));
    heartAnimationFrames.push(await heartAnimation.step(1.5, 0));
    let heartAnimationSequence = addBufferSequence(
        heartAnimationFrames,
        "jpeg"
    );
    let heartAnimationConcat = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${heartAnimationSequence} -framerate 20 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(heartAnimationSequence);

    let leftSideP = crop(buffers, {
        x: 0,
        y: 0,
        width: 50,
        height: 100,
        mode: "percent",
    });
    let rightSideP = crop(buffers, {
        x: 50,
        y: 0,
        width: 50,
        height: 100,
        mode: "percent",
    });
    let [leftSide, rightSide] = await Promise.all([leftSideP, rightSideP]);
    let sliceAnimation = await hookWeb3DAPIAnimation("ecube_sliced", {
        leftSideImageURL: bufferToDataURL(leftSide, "image/png"),
        rightSideImageURL: bufferToDataURL(rightSide, "image/png"),
    });
    let sliceAnimationFrames: Buffer[] = [];
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.5, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.48, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.45, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.4, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.34, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.26, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.14, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 1.0, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 0.85, 25));
    sliceAnimationFrames.push(await sliceAnimation.step(0.55, 0.7, 25.5));
    sliceAnimationFrames.push(await sliceAnimation.step(0.545, 0.5, 26));
    sliceAnimationFrames.push(await sliceAnimation.step(0.54, 0.3, 27));
    sliceAnimationFrames.push(await sliceAnimation.step(0.535, 0.05, 28));
    sliceAnimationFrames.push(await sliceAnimation.step(0.525, 0, 29));
    sliceAnimationFrames.push(await sliceAnimation.step(0.515, 0, 31));
    sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 33));
    sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 35));
    sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 36));
    sliceAnimationFrames.push(await sliceAnimation.step(0.5, 0, 36.5));
    let sliceAnimationSequence = addBufferSequence(
        sliceAnimationFrames,
        "jpeg"
    );
    let sliceAnimationConcat = await ffmpegBuffer(
        `-pattern_type sequence -f image2 -i http://localhost:56033/${sliceAnimationSequence} -framerate 20 $PRESET $OUT`,
        [],
        "mp4"
    );
    removeBuffer(sliceAnimationSequence);

    let zoomAndPlane = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomRotateOutput, "mp4"],
            [planeAnimationConcat, "mp4"],
        ]
    );
    let zoomPlaneAndHeart = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomAndPlane, "mp4"],
            [heartAnimationConcat, "mp4"],
        ]
    );
    let zoomPlaneHeartAndSlice = await ffmpegBuffer(
        `-i $BUF0 -i $BUF1 -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[out]" -map "[out]" $PRESET $OUT`,
        [
            [zoomPlaneAndHeart, "mp4"],
            [sliceAnimationConcat, "mp4"],
        ]
    );

    return zoomPlaneHeartAndSlice;
}