"use strict";
const debug = require("debug")("gdfs-web-test-signer");
debug("loading");
const Gdfs = require("../../index.js");
const Cookies = require("js-cookie");

function GdfsWebTestSigner() {
    this.createUi();
    this._txtClientId = document.querySelector("#txtClientId");
    this._txtApiKey = document.querySelector("#txtApiKey");
    this._btnConnect = document.querySelector("#btnConnect");
    this._btnConnect.onclick = () => this.connect();
    this._prepared = false;
}

GdfsWebTestSigner.prototype.createUi = function() {
    const clientId = Cookies.get("clientId") || null;
    const apiKey = Cookies.get("apiKey") || null;
    const authPanel = document.createElement("DIV");
    const testControl = document.querySelector("#test-control");
    testControl.appendChild(authPanel);
    authPanel.insertAdjacentHTML("beforeend", `
        <div style="margin: 60px 50px;">
            <h3>gdfs-ui authorization</h3>
            <div style="float:left; width:595px;">
                <div style="height:24px;">
                    <label>
                        <span style="display:inline-block;width:60px;">
                            clientId
                        </span>
                        <span style="display:inline-block; padding:0; margin: 0;">
                            <input id="txtClientId" type="text" size="70"
                                    style="margin:0; width:525px; height: 24px;"
                                    value="${clientId||''}"/>
                        </span>
                    </label>
                </div>
                <div style="height:24px;">
                    <label>
                        <span style="display:inline-block;width:60px;">
                            apiKey
                        </span>
                        <span style="display:inline-block; padding:0; margin: 0;">
                            <input id="txtApiKey" type="text" size="70"
                                    style="margin:0; width:525px; height: 24px;"
                                    value="${apiKey||''}"/>
                        </span>
                    </label>
                </div>
            </div>
            <div style="float: left; width: 70px;">
                <button id="btnConnect" type="button"
                        style="margin:0; width:70px; height: 48px;">
                    Connect
                </button>
            </div>
            <br clear="all"/>
            <span id="gdfs-ui-test-status">Waiting for a connection</span>
        </div>
        <div id="gdfs-ui"></div>
    `);
};

GdfsWebTestSigner.prototype.setStatus = function(message) {
    const txtStatus = document.querySelector("#gdfs-ui-test-status");
    txtStatus.innerHTML = message;
};

GdfsWebTestSigner.prototype.prepare = function() {
    return new Promise( resolve => {
        if(this._prepared) {
            resolve();
            return;
        }
        Gdfs.signInStatusChangeEvent.listen(() => {
            debug(`signInStatusChangeEvent Start`);
            try {
                if(Gdfs.isSignedIn()) {
                    this._txtClientId.setAttribute("disabled", "disabled");
                    this._txtApiKey.setAttribute("disabled", "disabled");
                    this._btnConnect.setAttribute("disabled", "disabled");
                    this.setStatus( "The connection establed and a user signed in" );
                    this._prepared = true;
                    resolve();
                } else {
                    this.setStatus( "The test is authorizing the user account." );
                    Gdfs.signIn();
                }
            } catch(err) {
                this.setStatus( `Error ${err.message}` );
                debug(err.stack);
            }
            debug(`signInStatusChangeEvent End`);
        });
        this.connect();
    });
};

GdfsWebTestSigner.prototype.started = function() {
    this.setStatus( "The test is running ..." );
};

GdfsWebTestSigner.prototype.done = function() {
    this.setStatus( "The test has done." );
};

GdfsWebTestSigner.prototype.connect = async function() {
    try {
        const clientId = this._txtClientId.value;
        const apiKey = this._txtApiKey.value;
        debug(`clientId: ${clientId}`);
        debug(`apiKey: ${apiKey}`);
        this.setStatus( "The test is connecting to Google Drive API ..." );
        await Gdfs.loadApi(clientId, apiKey);
        Cookies.set("clientId", clientId, { "expires" : 365 * 100 });
        Cookies.set("apiKey", apiKey, { "expires" : 365 * 100 });
    } catch(err) {
        this.setStatus( `Error ${err.message}` );
        debug(err.stack);
    }
};

module.exports = GdfsWebTestSigner;
