"use strict";
const debug = require("debug")("web-test");
debug("loading");
const assert = require("chai").assert;
const Gdfs = require("../index.js");
const GdfsWebTestSigner = require("./lib/gdfs-web-test-signer.js");
describe("gdfs-ui", () => {
    const test = new GdfsWebTestSigner();
    describe("#getFiles", () => {
        it("should return at least one or more file's informations in " +
        "the root directory on the first invoking after signing in",
        async () => {
            await test.prepare();
            test.started();

            const fn = "/gdrive-fs-web-test.txt";
            const e = document.querySelector("#gdfs-ui");

            const prepare = new Gdfs.Ui(e);
            await prepare._gdfs.writeFile(fn, "text/plane", "test");

            const gdfsUi = new Gdfs.Ui(e);
            const files = await gdfsUi.getFiles(0, 10);
            await gdfsUi._gdfs.unlink(fn);
            for(const file of files) {
                debug(JSON.stringify(file));
            }
            assert.isArray(files);
            assert.notEqual(files.length, 0);

            test.done();
        }).timeout(0);
    });
});
