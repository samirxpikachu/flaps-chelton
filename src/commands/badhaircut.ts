import { FlapsCommand } from "../types";
import { getFileName, makeMessageResp, randomRedditImage } from "../lib/utils";

module.exports = {
    id: "badhaircut",
    name: "Bad Haircut",
    desc: "Gets a photo of a bad haircut.",
    async execute() {
        let image = await randomRedditImage("justfuckmyshitup");
        return makeMessageResp(
            "haircut",
            "",
            image,
            getFileName("Reddit_BadHaircut", "png")
        );
    },
} satisfies FlapsCommand;
