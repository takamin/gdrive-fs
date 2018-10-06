"use strict";
const debug = require("debug")("gdrive-fs");
const Gdfs = require("./lib/gdfs.js");
Gdfs.Ui = require("./lib/gdfs-ui.js");
Gdfs.Path = require("./lib/gdfs-path.js");
try {
    const context = (Function("return this;"))();
    if(context === window) {
        window.Gdfs = Gdfs;
    }
} catch(err) {
    debug(err.message);
}
module.exports = Gdfs;
