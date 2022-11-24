const getRandomValues = require("get-random-values");
const fetch = require("node-fetch");

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

function tenorURLToGifURL(url) {
    var searchString = '<meta class="dynamic" name="twitter:image" content="';
    return new Promise((resl) => {
        fetch(url)
            .then((r) => r.text())
            .then((data) => {
                var newURL = data
                    .substring(data.indexOf(searchString) + searchString.length)
                    .split('"')[0];
                resl(newURL);
            });
    });
}

module.exports = {
    uuidv4: uuidv4,
    tenorURLToGifURL: tenorURLToGifURL,
};
