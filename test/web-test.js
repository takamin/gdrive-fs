"use strict";
const assert = require("chai").assert;
const Gdfs = require("../index.js");
const testMocha = () => {
    describe("gdfs-ui", () => {
        describe("#getFiles", () => {
            it("should return at least one or more file's informations in the root directory on the first invoking after signing in", async () => {
                const fn = "/gdrive-fs-web-test.txt";
                const e = document.querySelector("#gdfs-ui");

                const prepare = new Gdfs.Ui(e);
                await prepare._gdfs.writeFile(fn, "text/plane", "test");

                const gdfsUi = new Gdfs.Ui(e);
                const files = await gdfsUi.getFiles(0, 10);
                await gdfsUi._gdfs.unlink(fn);
                document.body.insertAdjacentHTML("beforeend",
                    `<pre>${JSON.stringify(files, null, "    ")}</pre>`
                );

                assert.isArray(files);
                assert.notEqual(files.length, 0);
            }).timeout(0);
        });
    });
    mocha.run();
};

const debug = require("debug")("web-test");
debug("loading");
const Cookies = require("js-cookie");
const clientId = Cookies.get("clientId") || null;
const apiKey = Cookies.get("apiKey") || null;
const authPanel = document.createElement("DIV");
document.body.appendChild(authPanel);
authPanel.style.display = "none";
authPanel.insertAdjacentHTML("beforeend", `
    <div id="gdfs-ui"></div>
    <div>
        <label>
            <span style="display:inline-block;width:100px;">
                clientId
            </span>
            <span style="display:inline-block;width:400px;">
                <input id="txtClientId" type="text" size="70" value="${clientId||''}"/>
            </span>
        </label>
    </div>
    <div>
        <label>
            <span style="display:inline-block;width:100px;">
                apiKey
            </span>
            <span style="display:inline-block;width:400px;">
                <input id="txtApiKey" type="text" size="70" value="${apiKey||''}"/>
            </span>
        </label>
    </div>
    <div>
        <button id="btnConnect" type="button">Start test</button>
    </div>
`);
const txtClientId = document.querySelector("#txtClientId");
const txtApiKey = document.querySelector("#txtApiKey");
document.querySelector("#btnConnect").onclick = async () => {
    try {
        const clientId = txtClientId.value;
        const apiKey = txtApiKey.value;
        debug(`clientId: ${clientId}`);
        debug(`apiKey: ${apiKey}`);
        await Gdfs.loadApi(clientId, apiKey);
        Cookies.set("clientId", clientId, { "expires" : 365 * 100 });
        Cookies.set("apiKey", apiKey, { "expires" : 365 * 100 });
    } catch(err) {
        debug(err.stack);
        return false;
    }
    return true;
};

Gdfs.signInStatusChangeEvent.listen(() => {
    debug(`signInStatusChangeEvent Start`);
    try {
        if(Gdfs.isSignedIn()) {
            testMocha();
            authPanel.style.display = "none";
        } else {
            Gdfs.signIn();
        }
    } catch(err) {
        debug(err.stack);
    }
    debug(`signInStatusChangeEvent End`);
});

authPanel.style.display = "block";
