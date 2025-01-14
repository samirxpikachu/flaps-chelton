const video = require("./video");
const { uuidv4 } = require("./ai");
const { sendWebhook, sendWebhookFile } = require("./webhooks");
const fs = require("fs");
const path = require("path");
const { filesize } = require("filesize");
const e = require("express");
const mime = require("mime-types");
const { log, esc, Color } = require("./log");

async function addText(name, text, msg) {
    if (typeof text == "string") {
        text = text.split(":");
    }
    var id = uuidv4().replace(/-/gi, "") + ".gif";
    var gifData = fs
        .readFileSync(path.join(__dirname, "..", "images/gif/gifdata.txt"))
        .toString()
        .split("\r\n")
        .filter((l) => {
            return l.split(" ")[0] == name;
        })[0]
        .split(" ");
    // Name
    // Font size
    // Text X 1
    // Text Y 1
    // Text X 2
    // Text Y 2
    video
        .addText("images/gif/" + name + ".gif", "images/cache/" + id, {
            text: text[0],
            fontsize: gifData[1],
            x: gifData[2],
            y: gifData[3],
        })
        .then(async () => {
            var id2 = uuidv4().replace(/-/gi, "") + ".gif";
            video
                .addText("images/cache/" + id, "images/cache/" + id2, {
                    text: text[1],
                    fontsize: gifData[1],
                    x: gifData[4],
                    y: gifData[5],
                })
                .then(() => {
                    sendWebhookFile(
                        "ffmpeg",
                        "images/cache/" + id,
                        msg.channel
                    );
                });
        });
}

function n(type) {
    return (
        type + "_" + uuidv4().toUpperCase().replace(/-/gi, "").substring(0, 8)
    );
}
var types = {
    image: ["image/png", "image/jpeg", "image/webp"],
    video: ["video/mp4", "video/x-matroska"],
    text: ["text/plain"],
    json: ["application/json"],
    gif: ["image/gif"],
    audio: ["audio/mpeg", "audio/aac"],
};

function getTypeSingular(ct) {
    var type = "unknown";
    Object.entries(types).forEach((a) => {
        if (a[1].includes(ct)) type = a[0];
    });
    return type;
}
async function doEffect(effect, input, name, options, msg) {
    async function done(out) {
        var fsize = fs.statSync(out).size;
        var formattedFilesize = filesize(fsize);
        sendWebhookFile(
            "ffmpeg",
            out,
            msg.channel,
            {},
            options._filesize ? "File Size: " + formattedFilesize : undefined
        );
    }
    if (typeof input == "string") {
        effect(
            "images/cache/" + input,
            "images/cache/" +
                n("Effect_" + name) +
                "." +
                (options._ext || input.split(".").pop()),
            options
        )
            .then(done)
            .catch((out) => {
                sendWebhook("ffmpeg", out.stack || out, msg.channel);
            });
    } else {
        effect(
            input.map((x) => "images/cache/" + x),
            "images/cache/" +
                n("Effect_" + name) +
                "." +
                (options._ext ||
                    input[
                        typeof options._extindex === "number"
                            ? options._extindex
                            : 0
                    ]
                        .split(".")
                        .pop()),
            options
        )
            .then(done)
            .catch((out) => {
                sendWebhook("ffmpeg", out.stack || out, msg.channel);
            });
    }
}
async function caption2(name, text, msg, att) {
    doEffect(
        video.caption2,
        name,
        "Caption2",
        { text: text, w: att.width, h: att.height },
        msg
    );
}
async function convertMKVtoMP4(name, msg) {
    doEffect(video.mkvmp4, name, "Convert-MKV-MP4", {}, msg);
}
async function camEffect(name, msg) {
    doEffect(video.camEffect, name, "CamEffect", {}, msg);
}
async function gifNoAudio(name, msg) {
    doEffect(video.gifNoAudio, name, "Convert-GIF-MP4", {}, msg);
}
async function loop(name, amt, msg) {
    doEffect(video.loop, name, "Loop", { amount: amt }, msg);
}
async function datamosh(name, msg) {
    doEffect(
        video.datamosh,
        name,
        "Datamosh",
        {
            /*  _ext: "webm"  */
        },
        msg
    );
}
async function compressGIF(name, msg) {
    doEffect(video.compressGIF, name, "CompressGIF", { _filesize: true }, msg);
}
async function holyMolyGreenscreen(name, msg) {
    doEffect(video.holyMolyGreenscreen, name, "HolyMoly", { _ext: "mp4" }, msg);
}
async function christmasWeek(name, msg) {
    doEffect(video.christmasWeek, name, "ChristmasWeek", { _ext: "mp4" }, msg);
}
async function stack(names, msg) {
    doEffect(video.stack, names, "Stack", {}, msg);
}
async function stack2(names, msg) {
    var types = names.map((x) => getTypeSingular(mime.lookup(x)));
    doEffect(
        video.stack2,
        names,
        "Stack2",
        {
            _extindex:
                types.indexOf("video") > -1
                    ? types.indexOf("video")
                    : types.indexOf("gif") > -1
                    ? types.indexOf("gif")
                    : 0,
        },
        msg
    );
}
async function spin(name, length, speed, gif, msg) {
    doEffect(
        video.spin,
        name,
        "Spin",
        { _ext: gif ? "gif" : "mp4", length, speed, gif },
        msg
    );
}
async function tint(name, color, msg) {
    doEffect(video.tint, name, "Tint", { color }, msg);
}
async function imagestogif(name, msg) {
    doEffect(video.imagestogif, name, "ImgGif", { _ext: "mp4" }, msg);
}
async function cookingVideo(name, msg) {
    var id = n("Effect_CookingVideo");
    var ext = "." + name.split(".").pop();
    video
        .cookingVideo("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ext + ".mp4",
                msg.channel
            );
        });
}
async function perseverantia(name, msg) {
    doEffect(video.perseverantia, name, "Perseverantia", {}, msg);
}
async function img2vid(name, length, msg) {
    doEffect(
        video.img2vid,
        name,
        "Img2Vid",
        { length: length, _ext: "mp4" },
        msg
    );
}
async function simpleMemeCaption(name, text, msg, client, url) {
    if (!url) url = msg.attachments.first().url;
    if (parseInt(msg.content.split(" ")[1])) {
        text = text.split(" ").slice(1).join(" ");
    }
    if (typeof text == "string") {
        text = text.split(":");
    }
    if (!text[1]) {
        text[1] = "";
    }
    var id = n("Effect_Caption");
    var ext = "." + url.split(".").pop();
    var subtitleFileData = `1
00:00:00,000 --> 00:50:00,000
${text[0]}`;
    var subtitleFileData2 = `1
00:00:00,000 --> 00:50:00,000
${text[1]}`;
    fs.writeFileSync("./subs.srt", subtitleFileData);
    fs.writeFileSync("./subs_bottom.srt", subtitleFileData2);
    video
        .simpleMemeCaption("images/cache/" + name, "images/cache/" + id + ext, {
            fontSize: !parseInt(msg.content.split(" ")[1])
                ? 30
                : parseInt(msg.content.split(" ")[1]),
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function squash(name, msg) {
    var id = n("Effect_Squash");
    var ext = "." + name.split(".").pop();
    video
        .squash("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function compress(name, msg) {
    var id = n("Effect_Compress");
    var ext = "." + name.split(".").pop();
    video
        .compress("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function speed(name, msg) {
    var id = n("Effect_Speed");
    var ext = "." + name.split(".").pop();
    video
        .speed(
            "images/cache/" + name,
            "images/cache/" + id + ext,
            parseFloat(msg.content.split(" ")[1]) || 1.5
        )
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function bassBoost(name, msg) {
    var id = n("Effect_BassBoost");
    var ext = "." + name.split(".").pop();
    video
        .bassBoost("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function theHorror(name, msg) {
    var id = n("Effect_TheHorror");
    video
        .theHorror("images/cache/" + name, "images/cache/" + id + ".mp4")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function stewie(name, msg) {
    var id = n("Effect_Stewie");
    video
        .stewie("images/cache/" + name, "images/cache/" + id + ".mp4")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function reverse(name, msg) {
    var id = n("Effect_Reverse");
    var ext = "." + name.split(".").pop();
    video
        .reverse("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function stretch(name, msg) {
    var id = n("Effect_Stretch");
    var ext = "." + name.split(".").pop();
    video
        .stretch("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function invert(name, msg) {
    var id = n("Effect_Invert");
    var ext = "." + name.split(".").pop();
    video
        .invert("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function blackWhite(name, msg) {
    var id = n("Effect_BlackWhite");
    var ext = "." + name.split(".").pop();
    video
        .blackWhite("images/cache/" + name, "images/cache/" + id + ext)
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function trim(name, times, msg) {
    var id = n("Effect_Trim");
    var ext = "." + name.split(".").pop();
    video
        .trim("images/cache/" + name, "images/cache/" + id + ext, {
            start: times[0],
            end: times[1],
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}
async function complexFFmpeg2(name, args, msg) {
    var id = n("Effect_AICommand");
    var ext = "." + name.split(".").pop();
    return video
        .complexFFmpeg("images/cache/" + name, "images/cache/" + id + ext, {
            args: args,
        })
        .then(() => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        })
        .catch((d) => {
            sendWebhook("ffmpeg", d, msg.channel);
        });
}
async function videoGif(name, msg) {
    var id = n("Effect_VideoGif");
    video
        .videoGif("images/cache/" + name, "images/cache/" + id + ".gif")
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".gif",
                msg.channel
            );
        });
}
async function imageAudio(name, msg, exts, reverse) {
    var id = n("Effect_CImageAudio");
    video
        .imageAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function semiTransparentOverlay(name, msg, exts, reverse) {
    var id = n("Effect_CTransparentOverlay");
    video
        .semiTransparentOverlay(
            "images/cache/" + name,
            "images/cache/" + id,
            reverse,
            exts
        )
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function gifAudio(name, msg, exts, reverse) {
    var id = n("Effect_CGifAudio");
    video
        .gifAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function videoAudio(name, msg, exts, reverse) {
    var id = n("Effect_CVideoAudio");
    video
        .videoAudio("images/cache/" + name, "images/cache/" + id, reverse, exts)
        .then(async () => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function armstrongify(name, msg, duration) {
    var id = n("Effect_Armstrong");
    var ext = name.endsWith(".mp4") ? ".mp4" : ".png";
    video
        .armstrongify("images/cache/" + name, "images/cache/" + id, {
            videoLength: duration,
            isVideo: ext == ".mp4",
        })
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function baitSwitch(name, msg, client, opt = {}) {
    var id = n("Effect_BaitSwitch");
    video
        .baitSwitch("images/cache/" + name, "images/cache/" + id, opt)
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function stitch(names, msg) {
    var id = n("Effect_Stitch");
    video
        .stitch(
            ["images/cache/" + names[0], "images/cache/" + names[1]],
            "images/cache/" + id
        )
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function stitch2(names, msg) {
    var id = n("Effect_Stitch2");
    video
        .stitch2(
            ["images/cache/" + names[0], "images/cache/" + names[1]],
            "images/cache/" + id
        )
        .then(() => {
            sendWebhookFile(
                "ffmpeg",
                "images/cache/" + id + ".mp4",
                msg.channel
            );
        });
}
async function geq(name, msg) {
    var id = n("Effect_GEQ");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + name.split(".").pop();
    }
    video
        .geq(
            name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name,
            "images/cache/" + id + ext,
            {
                red: msg.content.split(" ").slice(1)[0],
                green:
                    msg.content.split(" ").slice(1).length > 1
                        ? msg.content.split(" ").slice(1)[1]
                        : msg.content.split(" ").slice(1)[0],
                blue:
                    msg.content.split(" ").slice(1).length > 1
                        ? msg.content.split(" ").slice(1)[2]
                        : msg.content.split(" ").slice(1)[0],
            }
        )
        .then(async () => {
            sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
        });
}

async function complexFFmpeg(name, msg) {
    var id = n("Effect_Complex");
    var ext = ".mp4";
    if (msg.attachments.first()) {
        ext = "." + name.split(".").pop();
    }
    video
        .complexFFmpeg(
            name == "nullsrc" ? "nullsrc=s=256x256" : "images/cache/" + name,
            "images/cache/" + id + ext,
            {
                args: msg.content.split(" ").slice(1).join(" "),
            }
        )
        .then(async () => {
            try {
                sendWebhookFile(
                    "ffmpeg",
                    "images/cache/" + id + ext,
                    msg.channel
                );
            } catch {
                sendWebhook(
                    "ffmpeg",
                    "oops, looks like the vido too bigge.",
                    msg.channel
                );
            }
        });
}

async function mimeNod(bpm, msg) {
    var id = n("MimeNod");
    var ext = ".gif";
    video.mimeNod("images/cache/" + id + ext, bpm).then(async () => {
        sendWebhookFile("ffmpeg", "images/cache/" + id + ext, msg.channel);
    });
}

module.exports = {
    addText: addText,
    simpleMemeCaption: simpleMemeCaption,
    imageAudio: imageAudio,
    geq: geq,
    squash: squash,
    stretch: stretch,
    trim: trim,
    stitch: stitch,
    videoAudio: videoAudio,
    videoGif: videoGif,
    armstrongify: armstrongify,
    complexFFmpeg: complexFFmpeg,
    baitSwitch: baitSwitch,
    mimeNod: mimeNod,
    gifAudio: gifAudio,
    compress: compress,
    caption2: caption2,
    reverse: reverse,
    theHorror: theHorror,
    stewie: stewie,
    bassBoost: bassBoost,
    cookingVideo: cookingVideo,
    speed: speed,
    invert: invert,
    convertMKVtoMP4,
    stitch2,
    semiTransparentOverlay,
    blackWhite,
    camEffect,
    datamosh,
    compressGIF,
    gifNoAudio,
    loop,
    complexFFmpeg2,
    holyMolyGreenscreen,
    christmasWeek,
    stack,
    stack2,
    spin,
    perseverantia,
    tint,
    imagestogif,
    img2vid,
};
