const fetch = require("node-fetch");
const fs = require("fs");
const owoify = require("owoify-js").default;
const Discord = require("discord.js");
const path = require("path");

var users = {};

updateUsers();

/**
 *
 * @param {string} id
 * @param {Discord.MessageEmbed} embed
 * @param {Discord.TextChannel} msgChannel
 * @param {Object} customData
 * @param {Discord.Message} msg
 * @returns {Promise}
 */

function sendWebhook(
    id,
    content,
    msgChannel,
    customData = {},
    msg,
    comps = [],
    e
) {
    return new Promise((resolve, _reject) => {
        updateUsers();
        if (!users[id] && id != "custom") {
            return sendWebhook(
                "flapserrors",
                'Error: unknown webhook bot "' +
                id +
                '". Original message content:\n---\n' +
                content,
                false,
                msgChannel
            );
        }
        if (!msgChannel) {
            msgChannel = customData;
            customData = msg;
            msg = comps;
            comps = e;
        }
        var custom = false;
        if (id == "custom") {
            content = customData.content;
            if (customData.avatar == "attached" && msg.attachments.first()) {
                customData.avatar = msg.attachments.first().url;
            }
            custom = true;
        } else {
            if (users[id][2]) content = eval(users[id][2])(content);
        }
        var dave = fs.readFileSync("./dave.txt").toString() == "yes";
        msgChannel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                );
                var data = {
                    content: content,
                    username: custom ?
                        customData.username :
                        dave ?
                        "dave " + Math.floor(Math.random() * 200).toString() :
                        users[id][0] == "__FlapsNick__" ?
                        msgChannel.guild.me.nickname || client.user.username :
                        users[id][0],
                    avatar_url: custom ? customData.avatar : users[id][1],
                    components: comps, // there used to be a typo on this line
                };
                if (!hook) {
                    msgChannel
                        .createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                            avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                            reason: "flap chelton needed a webhook for the channel.",
                        })
                        .then((hook2) => {
                            trySend(hook2.url + "?wait=true", data)
                                .then((d) => d.json())
                                .then((d) => {
                                    resolve(d.id);
                                })
                                .catch(() => {
                                    resolve("ALL_WAIT");
                                });
                        })
                        .catch(console.error);
                } else {
                    trySend(hook.url + "?wait=true", data)
                        .then((d) => d.json())
                        .then((d) => {
                            resolve(d.id);
                        })
                        .catch(() => {
                            resolve("ALL_WAIT");
                        });
                }
            })
            .catch(console.error);
    });
}

function trySend(url, data) {
    return new Promise((res, rej) => {
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        }).then((r) => {
            if (r.status == 429) {
                rej(r);
            }
            res(r);
        });
    });
}

function editWebhookMsg(msgid, msgChannel, content) {
    return new Promise((resolve, _reject) => {
        msgChannel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                );
                fetch(hook.url + "/messages/" + msgid, {
                    method: "PATCH",
                    body: JSON.stringify({
                        content: content,
                    }),
                    headers: { "Content-Type": "application/json" },
                }).then(() => {
                    resolve();
                });
            })
            .catch(console.error);
    });
}

function editWebhookFile(msgid, msgChannel, path, pretext = "") {
    if (multipartUpload) {} else {
        client.channels.cache
            .get("956316856422137856")
            .send({
                files: [{
                    attachment: path,
                }, ],
            })
            .catch((e) => {
                sendWebhook(id, "Send error: " + e, msgChannel);
            })
            .then((message) => {
                if (!message) {
                    return;
                }
                editWebhookMsg(
                    msgid,
                    msgChannel,
                    pretext + "\n" + message.attachments.first().url
                );
            });
    }
}
/**
 * @type {Discord.Client}
 */
var client;

function setClient(c) {
    client = c;
}

var multipartUpload = false;

async function sendWebhookFile(
    id,
    filename,
    msgChannel,
    cd,
    pre = "",
    failcb = null
) {
    if (!multipartUpload) {
        if (!fs.existsSync(filename)) {
            return sendWebhook(
                id,
                "Error: File does not exist.\n" + filename,
                msg.channel,
                cd
            );
        }
        var stats = fs.statSync(filename);
        var fileSize = stats.size / (1024 * 1024);
        if (fileSize > 8) {
            if (failcb) {
                failcb();
            } else {
                console.log(
                    "[konalt-upload] File larger than 8MB, sending to konalt"
                );
                var fn = path.basename(filename);
                var konalt_path =
                    "E:/MBG/2Site/sites/konalt/flaps/bigfile/" + fn;
                fs.copyFile(filename, konalt_path, (err) => {
                    if (err) {
                        sendWebhook(id, "Send error: " + err, msgChannel);
                    } else {
                        console.log("[konalt-upload] copy successful");
                        var konaltURL =
                            "https://konalt.us.to:4930/bigfile/" + fn;
                        sendWebhook(
                            id,
                            pre +
                            "\nThe resulting file was larger than 8MB, so it was uploaded to an external server.\n" +
                            konaltURL,
                            msgChannel
                        );
                    }
                });
            }
        } else {
            client.channels.cache
                .get("956316856422137856")
                .send({
                    files: [{
                        attachment: filename,
                    }, ],
                })
                .catch((e) => {
                    sendWebhook(id, "Send error: " + e, msgChannel);
                })
                .then((message) => {
                    if (!message) {
                        return;
                    }
                    sendWebhook(
                        id,
                        pre + "\n" + message.attachments.first().url,
                        msgChannel,
                        cd
                    );
                });
        }
    } else {
        sendWebhook(
            id,
            "Send error: Multipart form uploads are enabled, which are not implemented yet.\nSet multipartUpload to false",
            msgChannel
        );
    }
}

async function sendWebhookAttachment(id, att, msgChannel) {
    client.channels.cache
        .get("956316856422137856")
        .send({
            files: [att],
            content: "Cheltify",
        })
        .catch((e) => {
            sendWebhook(id, "Send error: " + e, msgChannel);
        })
        .then((message) => {
            if (!message) {
                return;
            }
            sendWebhook(id, message.attachments.first().url, msgChannel);
        });
}

async function sendWebhookFileButton(id, filename, buttons, msgChannel) {
    if (multipartUpload) {} else {
        client.channels.cache
            .get("956316856422137856")
            .send({
                files: [{
                    attachment: filename,
                }, ],
            })
            .catch((e) => {
                sendWebhook(id, "Send error: " + e, msgChannel);
            })
            .then((message) => {
                if (!message) {
                    return;
                }
                var content = message.attachments.first().url;
                buttons = buttons.map((btn) => {
                    btn.custom_id =
                        btn.id +
                        "_" +
                        Math.floor(Math.random() * 4096).toString(16);
                    btn.id = undefined;
                    delete btn.id;
                    return btn;
                });
                buttons.forEach((button) => {
                    buttonCallbacks[button.custom_id] = button.cb || (() => {});
                });
                sendWebhook(id, content, msgChannel, {}, null, [
                    { type: 1, components: buttons },
                ]);
                sendWebhook(
                    id,
                    message.attachments.first().url,
                    msgChannel, {},
                    null, [{ type: 1, components: buttons }]
                );
            });
    }
}

var buttonCallbacks = {};

function sendWebhookButton(id, content, buttons, msgChannel) {
    buttons = buttons.map((btn) => {
        btn.custom_id =
            btn.id + "_" + Math.floor(Math.random() * 4096).toString(16);
        btn.id = undefined;
        delete btn.id;
        return btn;
    });
    buttons.forEach((button) => {
        buttonCallbacks[button.custom_id] = button.cb || (() => {});
    });
    sendWebhook(id, content, msgChannel, {}, null, [
        { type: 1, components: buttons },
    ]);
}

function sendWebhookFileNew(id, content, path, msgChannel) {}

function sendWebhookEmbed(id, embed, msgChannel, customData = {}, msg) {
    return new Promise((resolve, _reject) => {
        try {
            msgChannel
                .fetchWebhooks()
                .then((hooks) => {
                    var hook = hooks.find(
                        (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                    );
                    if (!hook) {
                        msgChannel
                            .createWebhook(
                                "FlapsCheltonWebhook_" + msgChannel.id, {
                                    avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                                    reason: "flap chelton needed a webhook for the channel.",
                                }
                            )
                            .then((hook2) => {
                                fetch(hook2.url, {
                                    method: "POST",
                                    body: JSON.stringify({
                                        embeds: [embed],
                                        username: users[id][0],
                                        avatar_url: users[id][1],
                                    }),
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }).then(() => {
                                    resolve();
                                });
                            })
                            .catch(console.error);
                    } else {
                        console.log(`{
    "embeds": [${JSON.stringify(embed.toJSON())}],
    "username": ${users[id[0]]},
    "avatar_url": ${users[id[1]]}
}`);
                        fetch(hook.url, {
                                method: "POST",
                                body: `{
                                "embeds": [${JSON.stringify(embed.toJSON())}],
                                "username": "${users[id][0]}",
                                "avatar_url": "${users[id][1]}"
                            }`,
                                headers: { "Content-Type": "application/json" },
                            })
                            .then((r) => r.text())
                            .then((r) => {
                                console.log(r);
                            });
                    }
                })
                .catch(console.error);
        } catch (e) {
            console.log("aaahahahahaha");
            console.log(e);
        }
    });
}

function updateUsers() {
    var usersArray = fs
        .readFileSync("./flaps_users.txt", "utf8")
        .toString()
        .split("\r\n")
        .map((u) => {
            return u.split("--");
        });
    usersArray.forEach((user) => {
        users[user[0]] = [
            user[1],
            user[2].startsWith("http") ?
            user[2] :
            "https://media.discordapp.net/attachments/882743320554643476/" +
            user[2] +
            "/unknown.png",
            user[3],
        ];
    });
}

function sendWebhookImage(id, data) {
    return false;
}

module.exports = {
    sendWebhook: sendWebhook,
    sendWebhookEmbed: sendWebhookEmbed,
    sendWebhookImage: sendWebhookImage,
    updateUsers: updateUsers,
    users: users,
    editWebhookMsg: editWebhookMsg,
    sendWebhookFile: sendWebhookFile,
    setClient: setClient,
    sendWebhookButton: sendWebhookButton,
    buttonCallbacks: buttonCallbacks,
    editWebhookFile: editWebhookFile,
    sendWebhookAttachment: sendWebhookAttachment,
};