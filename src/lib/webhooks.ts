import { GuildChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { TextBasedChannel } from "discord.js";
import { PathLike, readFileSync } from "fs";

const defaultContent = "No Content";
const defaultUsername = "No Username";
const defaultAvatar =
    "https://media.discordapp.net/attachments/838732607344214019/1075967910696210492/flapjpg.jpg";
const defaultTts = false;
function baseSend(
    url: string,
    content: string = defaultContent,
    username: string = defaultUsername,
    avatar_url: string = defaultAvatar,
    file: PathLike | null = null,
    tts: boolean = defaultTts
) {
    let form = new FormData();
    if (file !== null) {
        form.append("file0", new Blob([readFileSync(file)]), file.toString());
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
    fetch("", {
        method: "POST",
        body: form,
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

export function sendWebhook(id: string, content: string, channel: TextChannel) {
    getWebhookURL(channel).then((url: string) => {
        baseSend(url, content, id);
    });
}
