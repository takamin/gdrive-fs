"use strict";
localStorage.debug = "*";
const debug = require("debug")("gdrive/public/index.js");
debug("loading");
const Cookies = require("js-cookie");
const Gdfs = require("../index.js");
const DOM = require("../lib/gdfs-dom-helper.js");
const FileList = require("./file-list.js");

const main = () => {
    const authPanel = document.querySelector("#google-drive-auth-panel");
    authPanel.innerHTML = "";
    const txtClientId = DOM.createElement("INPUT",
        { "type": "text", "size": 70, "value": Cookies.get("clientId"), });
    const txtApiKey = DOM.createElement("INPUT",
        { "type": "text", "size": 40, "value": Cookies.get("apiKey"),});
    const btnAuthorize = DOM.createButton(
        "Authorize", { style: { "display": "none" } },
        () => { if(!Gdfs.isSignedIn()) { Gdfs.signIn(); } }
    );
    const btnSignOut = DOM.createButton(
        "Sign Out", { style: { "display": "none" } },
        () => { if(Gdfs.isSignedIn()) { Gdfs.signOut(); } });
    DOM.append(authPanel,
        "clientId: ", txtClientId, "<br/>",
        "apiKey: ", txtApiKey, "<br/>",
        DOM.createButton(
            "Connect Google Drive API", async () => {
                debug("Connect.click");
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
                }
            }),
        btnAuthorize,
        btnSignOut,
    );

    // Listen events
    Gdfs.signInStatusChangeEvent.listen(() => {
        debug(`signInStatusChangeEvent Start`);
        if(Gdfs.isSignedIn()) {
            btnAuthorize.style.display = "none";
            btnSignOut.style.display = "block";
        } else {
            btnAuthorize.style.display = "block";
            btnSignOut.style.display = "none";
        }
        debug(`signInStatusChangeEvent End`);
    });
    const fileDlgs = Array.from(document.querySelectorAll(".gdrive-fs-ui"));
    for(const element of fileDlgs) {
        new FileList(element);
    }
};

main();
