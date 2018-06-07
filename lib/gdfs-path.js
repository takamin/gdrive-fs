"use strict";
const debug = require("debug")("GdfsPath");
debug("loading");

/**
 * Gdfs Path class.
 * @constructor
 * @param {string|undefined} pathname initial path.
 */
function GdfsPath(pathname) {
    this._lastSlash = true;
    this._absolute = true;
    this._paths = [];
    if(pathname != undefined) {
        this.parse(pathname);
    }
}


/**
 * Get a part of path.
 * @returns {GdfsPath} A path object including only path.
 */
GdfsPath.prototype.getPathPart = function() {
    if(this._lastSlash) {
        return new GdfsPath(this.toString());
    }
    const paths = this.elements();
    paths.splice(-1, 1, "");
    debug(`getPathPart: paths: ${JSON.stringify(paths)}`);
    return new GdfsPath(paths.join("/"));
};

/**
 * Get filename part of path.
 * @returns {string} A filename.
 */
GdfsPath.prototype.getFilename = function() {
    return this.elements().pop();
};

/**
 * Get paths elements.
 * @returns {Array<string>} the elements.
 */
GdfsPath.prototype.elements = function() {
    const elements = this._paths.map(item => item);
    if(this._absolute) {
        elements.unshift("");
    }
    if(this._lastSlash) {
        elements.push("");
    }
    return elements;
};

/**
 * Create a new path object with joining the two paths.
 * 
 * @param {Array<GdfsPath>} paths The paths to join.
 * @returns {GdfsPath} The path that was joined.
 */
GdfsPath.merge = (...paths) => {
    debug(`Gdfs.merge: ${paths.map(p=>p.toString()).join(" | ")}`);
    return paths.reduce( (pathA, pathB, index) => {
        debug(`Gdfs.merge: Reducing #${index}`);
        debug(`Gdfs.merge: pathA: ${pathA.toString()}`);
        debug(`Gdfs.merge: pathB: ${pathB.toString()}`);
        if(typeof(pathA) === "string") {
            pathA = new GdfsPath(pathA);
        }
        if(typeof(pathB) === "string") {
            pathB = new GdfsPath(pathB);
        }
        const a = pathA.toString();
        const b = pathB.toString();
        if(pathB.isAbsolute()) {
            debug(`returns ${b}`);
            return new GdfsPath(b);
        }
        const joined = new GdfsPath([a, b].join("/"));
        debug(`Gdfs.merge: returns ${joined.toString()}`);
        return joined;
    });
};

const split_path = pathname => {
    const paths = [];
    let escaped = false;
    let i = 0;
    let element = "";
    let chars = pathname.split("");
    while(i < chars.length) {
        const c = chars[i];
        if(escaped) {
            element += c;
            escaped = false;
        } else if(c === "\\"){
            escaped = true;
        } else if(c === "/") {
            paths.push(element);
            element = "";
        } else {
            element += c;
        }
        i++;
    }
    paths.push(element);
    if(escaped) {
        throw new Error(`Invalid pathname ${pathname}`);
    }
    if(paths.length == 0) {
        throw new Error("Invalid pathname. It should not be empty.");
    }
    return paths;
};

/**
 * Set a path repersented by a string.
 * @param {string} pathname A path name to parse
 * @return {undefined}
 */
GdfsPath.prototype.parse = function(pathname) {
    let paths = split_path(pathname.replace(/\/+/g, "/"));
    debug(`parse ${JSON.stringify(pathname)} => ${JSON.stringify(paths)}`);
    const lastSlash = (paths[paths.length - 1] === "");
    const absolute = (paths[0] === "");
    if(lastSlash) {
        paths.pop();
    }
    if(absolute) {
        paths.shift();
    }
    this._lastSlash = !!lastSlash;
    this._absolute = !!absolute;
    for(;;) {
        let replacement = false;
        if(paths.length >= 2) {
            paths = paths.reduce( (acc, next) => {
                if(!Array.isArray(acc)) {
                    acc = [acc];
                }
                const last = acc[acc.length - 1];
                if(last !== ".." && next === "..") {
                    acc.pop();
                    replacement = true;
                } else if(last !== "." && next === ".") {
                    replacement = true;
                } else {
                    acc.push(next);
                }
                return acc;
            });
        }
        if(!replacement) {
            this._paths = paths;
            debug(`this._paths:${JSON.stringify(this._paths)}`);
            break;
        }
    }
};

/**
 * Returns if this represents an absolute path.
 * @returns {Boolean} True if this represents an absolute path, otherwise false.
 */
GdfsPath.prototype.isAbsolute = function() {
    return this._absolute;
};

/**
 * Returns if this represents a directory.
 * @returns {Boolean} True if this represents a directory, otherwise false.
 */
GdfsPath.prototype.isDirSpec = function() {
    return this._lastSlash;
};

/**
 * Returns a path represented by string.
 * @returns {string} The path that this is representing.
 */
GdfsPath.prototype.toString = function() {
    if(this._paths.length === 0) {
        return "/";
    }
    const rootSpec = this._absolute ? "/" : "";
    const dirSpec = this._lastSlash ? "/" : "";
    const pathname = `${rootSpec}${this._paths.join("/")}${dirSpec}`;
    return pathname;
};

module.exports = GdfsPath;
