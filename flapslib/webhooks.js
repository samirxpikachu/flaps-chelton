const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");
//eslint-disable-next-line no-unused-vars
const owoify = require("owoify-js").default;
//eslint-disable-next-line no-unused-vars
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

var dave = fs.readFileSync("./dave.txt").toString() == "yes";

function sendWebhook(
    id,
    content,
    msgChannel,
    customData = {},
    msg,
    comps = [],
    e
) {
    return new Promise((resolve) => {
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
                                    resolve(e);
                                });
                        })
                        .catch(console.error);
                } else {
                    trySend(hook.url + "?wait=true", data)
                        .then((d) => d.json())
                        .then((d) => {
                            resolve(d.id);
                        })
                        .catch((e) => {
                            resolve(e);
                            console.log(data);
                        });
                }
            })
            .catch(console.error);
    });
}

function getWebhook(msgChannel) {
    return new Promise((resolve) => {
        msgChannel
            .fetchWebhooks()
            .then((hooks) => {
                var hook = hooks.find(
                    (h) => h.name == "FlapsCheltonWebhook_" + msgChannel.id
                );
                if (!hook) {
                    msgChannel
                        .createWebhook("FlapsCheltonWebhook_" + msgChannel.id, {
                            avatar: "https://media.discordapp.net/attachments/882743320554643476/966013228641566760/numb.PNG",
                            reason: "flap chelton needed a webhook for the channel.",
                        })
                        .then((hook2) => {
                            resolve(hook2.url);
                        })
                        .catch(console.error);
                } else {
                    resolve(hook.url);
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
            if (r.status != 204) {
                rej(r);
            }
            res(r);
        });
    });
}

function editWebhookMsg(msgid, msgChannel, content) {
    return new Promise((resolve) => {
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
    if (multipartUpload) {
        console.log("pigon");
    } else {
        client.channels.cache
            .get("956316856422137856")
            .send({
                files: [{
                    attachment: path,
                }, ],
            })
            .catch((e) => {
                sendWebhook("flaps", "Send error: " + e, msgChannel);
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

var multipartUpload = true;

async function sendWebhookFile(
    id,
    filename,
    msgChannel,
    cd,
    pre = "",
    failcb = null
) {
    if (!fs.existsSync(filename)) {
        return sendWebhook(
            id,
            "Error: File does not exist.\n" + filename,
            msgChannel,
            cd
        );
    }
    updateUsers();
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
            var konalt_path = "E:/MBG/2Site/sites/konalt/flaps/bigfile/" + fn;
            fs.copyFile(filename, konalt_path, (err) => {
                if (err) {
                    sendWebhook(id, "Send error: " + err, msgChannel);
                } else {
                    console.log("[konalt-upload] copy successful");
                    var konaltURL = "https://konalt.us.to:4930/bigfile/" + fn;
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
        if (multipartUpload) {
            var form = new FormData();
            form.append("file0", fs.readFileSync(filename), filename);
            form.append(
                "payload_json",
                JSON.stringify({
                    content: pre ? pre : "",
                    username: users[id] ? users[id][0] : "?",
                    avatar_url: users[id] ?
                        users[id][1] :
                        "https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg",
                })
            );
            getWebhook(msgChannel).then((url) => {
                fetch(url, {
                    method: "POST",
                    body: form,
                }).then((r) => {
                    if (!r.status.toString().startsWith(2)) {
                        r.text().then((data) => {
                            sendWebhook("flapserrors", data, msgChannel);
                        });
                    } else {
                        client.channels.cache
                            .get("956316856422137856")
                            .send({
                                files: [{
                                    attachment: filename,
                                }, ],
                            })
                            .catch((e) => {
                                sendWebhook(
                                    id,
                                    "Flaps log error: " + e,
                                    msgChannel
                                );
                            });
                    }
                });
            });
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
    }
}

function sendWebhookBuffer(id, buf, txt, msgChannel, filename = "file.bin") {
    var form = new FormData();
    form.append("file0", buf, filename);
    form.append(
        "payload_json",
        JSON.stringify({
            content: txt ? txt : "",
            username: dave ?
                "dave " + Math.floor(Math.random() * 200).toString() :
                users[id][0] == "__FlapsNick__" ?
                msgChannel.guild.me.nickname || client.user.username :
                users[id][0],
            avatar_url: users[id][1],
        })
    );
    getWebhook(msgChannel).then((url) => {
        fetch(url, {
            method: "POST",
            body: form,
        });
    });
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
    if (multipartUpload) {
        console.log("gloria fortis miles");
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
    return sendWebhook(id, content, msgChannel, {}, null, buttons);
}

function editWebhookButton(msgid, content, buttons, msgChannel) {
    return new Promise((resolve) => {
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
                        components: buttons,
                    }),
                    headers: { "Content-Type": "application/json" },
                }).then(() => {
                    resolve();
                });
            })
            .catch(console.error);
    });
}

function sendWebhookEmbed(id, embed, msgChannel) {
    return new Promise((resolve) => {
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

function sendWebhookEmbedButton(id, embed, msgChannel) {
    return new Promise((resolve) => {
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
    dave = fs.readFileSync("./dave.txt").toString() == "yes";
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

module.exports = {
    sendWebhook: sendWebhook,
    sendWebhookEmbed: sendWebhookEmbed,
    updateUsers: updateUsers,
    users: users,
    editWebhookMsg: editWebhookMsg,
    sendWebhookFile: sendWebhookFile,
    setClient: setClient,
    sendWebhookButton: sendWebhookButton,
    buttonCallbacks: buttonCallbacks,
    editWebhookFile: editWebhookFile,
    sendWebhookAttachment: sendWebhookAttachment,
    sendWebhookBuffer: sendWebhookBuffer,
    sendWebhookFileButton: sendWebhookFileButton,
    sendWebhookEmbedButton: sendWebhookEmbedButton,
    editWebhookButton,
    getWebhook,
};