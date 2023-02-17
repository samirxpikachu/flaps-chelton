import { Collection, GuildChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { TextBasedChannel } from "discord.js";
import { PathLike, readFileSync } from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import { WebhookBot } from "../types";
import { readdir } from "fs/promises";
import { log } from "./logger";
import { users } from "./users";

const defaultContent = "No Content";
const defaultUsername = "No Username";
const defaultAvatar =
    "https://media.discordapp.net/attachments/838732607344214019/1075967910696210492/flapjpg.jpg";
const defaultTTS = false;
function baseSend(
    url: string,
    content: string = defaultContent,
    username: string = defaultUsername,
    avatar_url: string = defaultAvatar,
    buf: Buffer | null = null,
    filename: string | null = null,
    tts: boolean = defaultTTS
) {
    let form = new FormData();
    if (filename !== null) {
        form.append("file0", buf, filename);
    }
    form.append(
        "payload_json",
        JSON.stringify({
            content,
            username,
            avatar_url,
            tts,
        })
    );
    fetch(url, {
        method: "POST",
        body: form as unknown as URLSearchParams,
    });
}

function getWebhookURL(channel: TextChannel): Promise<string> {
    return new Promise((resolve) => {
        channel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + channel.id
                );
                if (!hook) {
                    channel
                        .createWebhook({
                            name: "FlapsCheltonWebhook_" + channel.id,
                        })
                        .then((hook2) => {
                            resolve(hook2.url as string);
                        })
                        .catch(console.error);
                } else {
                    resolve(hook.url as string);
                }
            })
            .catch(console.error);
    });
}

export let hooks: Collection<string, WebhookBot> = new Collection();

export function updateUsers(): Promise<void> {
    return new Promise((res, rej) => {
        log("Loading webhook bots...", "start");
        for (const user of users) {
            hooks.set(user.id, user);
        }
        res();
    });
}

export function sendWebhook(
    id: string,
    content: string,
    channel: TextChannel,
    buffer: Buffer | null = null,
    filename: string | null = null
) {
    getWebhookURL(channel).then((url: string) => {
        let user: WebhookBot = hooks.get(id);
        baseSend(
            url + "?wait=true",
            content,
            user?.name || "wh:" + id,
            user?.avatar || "https://konalt.us.to/flaps/avatars/" + id + ".png",
            buffer,
            filename
        );
    });
}
