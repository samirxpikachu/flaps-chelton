const cp = require("child_process");
const fs = require("fs");
const fetch = import("node-fetch");

var lastNL = true;
var lastLogCount = 20;
var lastLog = [];

function run() {
    console.log(`Starting flaps...`);
    var proc = cp.spawn("node", "dist/index.js".split(" "));
    proc.stdout.on("data", (data) => {
        process.stdout.write(data);
        lastNL = data.toString().endsWith("\n");
        if (lastLog.length == lastLogCount) lastLog.shift();
        lastLog.push(data.toString());
    });
    proc.stderr.on("data", (data) => {
        //if (data.toString().includes("Pango")) return; // fuck you node-canvas
        process.stdout.write((lastNL ? "[ERR] " : "") + data);
        lastNL = data.toString().endsWith("\n");
        if (lastLog.length == lastLogCount) lastLog.shift();
        lastLog.push(data.toString());
    });
    proc.on("close", (code) => {
        console.log(`Exit with code ${code}`);
        sendError();
        lastLog = [];
        lastNL = true;
        run();
    });
}

function sendError() {
    return;
    var url = fs.readFileSync("./errorhook.txt").toString();
    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            content: `your error was: damn \`\`\`ansi\n${lastLog.join(
                ""
            )}\`\`\`\n broken flaps: you Did it\nError: come here boy\nme: 🏃🏃🏃`,
            avatar_url:
                "https://media.discordapp.net/attachments/882743320554643476/966053990427156650/unknown.png",
            username: "CHELTON FUCKING CRASHED",
        }),
        headers: { "Content-Type": "application/json" },
    });
}

run();
