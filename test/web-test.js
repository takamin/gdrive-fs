"use strict";
const debug = require("debug")("web-test");
const JSON_stringify = require("yea-stringify");
debug("loading");
const assert = require("chai").assert;
const Gdfs = require("../index.js");
const GdfsWebTestSigner = require("./lib/gdfs-web-test-signer.js");
const mocha_getTitle = item => {
    if("_runnable" in item) {
        return mocha_getTitle(item._runnable);
    }
    if("parent" in item) {
        return mocha_getTitle(item.parent) + "/" + item.title;
    }
    return item.title || "";
};
describe("gdfs-ui", () => {
    const test = new GdfsWebTestSigner();
    describe("#getFiles", () => {
        it("should return at least one or more file's informations in " +
        "the root directory on the first invoking after signing in",
        async function () {
            const title = mocha_getTitle(this);
            debug(`Start of "${title}"`);

            await test.prepare();
            test.started();

            const fn = "/gdrive-fs-web-test.txt";
            const e = document.querySelector("#gdfs-ui");

            const prepare = new Gdfs.Ui(e);
            await prepare._gdfs.writeFile(fn, "text/plane", "test");

            const gdfsUi = new Gdfs.Ui(e);
            const files = await gdfsUi.getFiles(0, 10);
            await gdfsUi._gdfs.unlink(fn);
            assert.isArray(files);
            assert.notEqual(files.length, 0);

            test.done();
            debug(`End of "${title}"`);
        }).timeout(0);
    });
});
