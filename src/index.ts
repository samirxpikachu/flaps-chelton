import {
    ActivityType,
    Client,
    Collection,
    Partials,
    PresenceData,
    TextChannel,
} from "discord.js";
import { config } from "dotenv";
import { readFile, readdir } from "fs/promises";
import { hooks, sendWebhook, updateUsers } from "./lib/webhooks";
import { log } from "./lib/logger";
import { FlapsCommand, WebhookBot } from "./types";

log("Loading data...", "start");
config();
log("Dotenv loaded.", "start");

const client = new Client({
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
    ],
    intents: [
        "GuildMembers",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildVoiceStates",
        "GuildWebhooks",
        "MessageContent",
        "Guilds",
        "GuildPresences",
    ],
});

client.on("ready", () => {
    log("Logged in!", "start");

    readFile("saved_status.txt")
        .then((b) => b.toString("utf-8"))
        .then((statusData) => {
            let statusType =
                ActivityType[
                    statusData
                        .split(" ")[0]
                        .split("")
                        .map((l, i) =>
                            i == 0 ? l.toUpperCase() : l.toLowerCase()
                        )
                        .join("")
                ];
            let name = statusData.split(" ").slice(1).join(" ");

            client.user?.setPresence({
                activities: [
                    {
                        name,
                        type: statusType,
                        url: "https://konalt.us.to/",
                    },
                ],
                afk: false,
                status: "online",
            });
        });
});

const COMMAND_PREFIX = "!";
const WH_PREFIX = "<";

client.on("messageCreate", (msg) => {
    if (!(msg.channel instanceof TextChannel)) {
        msg.reply("this mf bot dont support dms get the fuck outta here");
        return;
    }
    if (msg.content.startsWith(WH_PREFIX)) {
        let id = msg.content.split(" ")[0].substring(WH_PREFIX.length);
        let content = msg.content.split(" ").slice(1).join(" ");
        if (hooks.get(id)) {
            sendWebhook(id, content, msg.channel);
            msg.delete();
        }
    }
    if (msg.content.startsWith(COMMAND_PREFIX)) {
        let commandId = msg.content
            .split(" ")[0]
            .substring(COMMAND_PREFIX.length);
        let commandArgs = msg.content.split(" ").slice(1);
        let commandArgString = msg.content.split(" ").slice(1).join(" ");

        let command = commands.find((cmd) => cmd.id == commandId);
        if (command) {
            command.execute(commandArgs, msg);
        }
    }
});

let commands: Collection<string, FlapsCommand> = new Collection();

log("Reading commands...", "start");

readdir(__dirname + "/commands", {
    withFileTypes: true,
}).then(async (files) => {
    log("Parsing commands...", "start");
    let fileNames = files.map((file) => file.name.split(".")[0]);
    for (const file of fileNames) {
        let command = require("./commands/" + file) as FlapsCommand;
        commands.set(command.id, command);
    }

    log("Loading webhook bots...", "start");
    updateUsers().then(() => {
        log("Logging in...", "start");
        client.login(process.env.DISCORD_TOKEN || "NoTokenProvided");
    });
});
