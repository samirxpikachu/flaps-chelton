const translate = require("translate-google");

const langObj = {
    auto: "Automatic",
    af: "Afrikaans",
    sq: "Albanian",
    ar: "Arabic",
    hy: "Armenian",
    az: "Azerbaijani",
    eu: "Basque",
    be: "Belarusian",
    bn: "Bengali",
    bs: "Bosnian",
    bg: "Bulgarian",
    ca: "Catalan",
    ceb: "Cebuano",
    ny: "Chichewa",
    "zh-cn": "Chinese Simplified",
    "zh-tw": "Chinese Traditional",
    co: "Corsican",
    hr: "Croatian",
    cs: "Czech",
    da: "Danish",
    nl: "Dutch",
    en: "English",
    eo: "Esperanto",
    et: "Estonian",
    tl: "Filipino",
    fi: "Finnish",
    fr: "French",
    fy: "Frisian",
    gl: "Galician",
    ka: "Georgian",
    de: "German",
    el: "Greek",
    gu: "Gujarati",
    ht: "Haitian Creole",
    ha: "Hausa",
    haw: "Hawaiian",
    iw: "Hebrew",
    hi: "Hindi",
    hmn: "Hmong",
    hu: "Hungarian",
    is: "Icelandic",
    ig: "Igbo",
    id: "Indonesian",
    ga: "Irish",
    it: "Italian",
    ja: "Japanese",
    jw: "Javanese",
    kn: "Kannada",
    kk: "Kazakh",
    km: "Khmer",
    ko: "Korean",
    ku: "Kurdish (Kurmanji)",
    ky: "Kyrgyz",
    lo: "Lao",
    la: "Latin",
    lv: "Latvian",
    lt: "Lithuanian",
    lb: "Luxembourgish",
    mk: "Macedonian",
    mg: "Malagasy",
    ms: "Malay",
    ml: "Malayalam",
    mt: "Maltese",
    mi: "Maori",
    mr: "Marathi",
    mn: "Mongolian",
    my: "Myanmar (Burmese)",
    ne: "Nepali",
    no: "Norwegian",
    ps: "Pashto",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    ma: "Punjabi",
    ro: "Romanian",
    ru: "Russian",
    sm: "Samoan",
    gd: "Scots Gaelic",
    sr: "Serbian",
    st: "Sesotho",
    sn: "Shona",
    sd: "Sindhi",
    si: "Sinhala",
    sk: "Slovak",
    sl: "Slovenian",
    so: "Somali",
    es: "Spanish",
    su: "Sudanese",
    sw: "Swahili",
    sv: "Swedish",
    tg: "Tajik",
    ta: "Tamil",
    te: "Telugu",
    th: "Thai",
    tr: "Turkish",
    uk: "Ukrainian",
    ur: "Urdu",
    uz: "Uzbek",
    vi: "Vietnamese",
    cy: "Welsh",
    xh: "Xhosa",
    yi: "Yiddish",
    yo: "Yoruba",
    zu: "Zulu",
};
const langs = Object.keys(langObj);

function doSingleTranslate(input) {
    return new Promise((resolve) => {
        var lang = langs[Math.floor(Math.random() * langs.length)];
        translate(input, { to: lang }).then((res) => {
            resolve([res, lang]);
        });
    });
}

function doSingleTranslateToEnglish(input) {
    return new Promise((resolve) => {
        var lang = "en";
        translate(input, { to: lang }).then((res) => {
            resolve(res);
        });
    });
}

async function doTranslate(input, depth) {
    var cur = input;
    var langList = ["en"];
    for (let i = 0; i < depth; i++) {
        var out = await doSingleTranslate(cur);
        cur = out[0];
        langList.push(out[1]);
    }
    cur = await doSingleTranslateToEnglish(cur);
    langList.push("en");
    return (
        langList
            .map((x) => {
                return langObj[x];
            })
            .join(" -> ") +
        "\n" +
        cur
    );
}

async function doTranslateSending(input, depth) {
    var cur = input;
    var out = "";
    for (let i = 0; i < depth; i++) {
        var o = await doSingleTranslate(cur);
        cur = o[0];
        var iter = await doSingleTranslateToEnglish(cur);
        out += iter + "\n";
    }
    return out;
}

module.exports = {
    doTranslate: doTranslate,
    doTranslateSending: doTranslateSending,
};
