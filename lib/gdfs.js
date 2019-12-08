/*global gapi:false*/
"use strict";
const debug = require("debug")("gdfs");
debug("loading");
const GdfsEvent = require("./gdfs-event.js");
const GdfsPath = require("./gdfs-path.js");

/**
 * Gdfs class is an interface for the Google Drive API v3.
 *
 * The instance manages a current working directory(CWD) and offers methods
 * to operate files and folders on the Google Drive by its pathname.
 *
 * Before creating an instance, the APIs must be loaded by the class method
 * [`loadApi`](#.loadApi) with a ClientId and ApiKey.
 * These had to be created in a project of Google devloper Console.
 *
 * And to operates files, user must sign-in with the Google account.
 * See [signIn](#.signIn) and [signOut](#.signOut).
 *
 * Instance's CWD is initialized to the root on constructor. It can be changed
 * by [chdir](#chdir) method. When it is changed, the 'oncwdupdate' callback
 * is fired. To know where the CWD is, The [cwd](#cwd) method is available.
 *
 * @constructor
 */
function Gdfs() {
    this._oncwdupdate = null;
    this._currentPath = [{ id: "root", name: "", }];
}

/**
 * Create Gdfs client.
 * @returns {Gdfs} The google drive interface that has a current directory.
 */
Gdfs.createClient = () => {
    return new Gdfs();
};

/**
 * signInStatusChangeEvent
 * @type {GdfsEvent}
 */
Gdfs.signInStatusChangeEvent = new GdfsEvent(
    window, "gdfs-signin-status-change");

/**
 * Load Google Drive APIs and initialize its client object.
 *
 * The loaded all APIs are accessible with a global `gapi` object.
 * But it is wrapped by this class so the users should not use it directly.
 *
 * @param {string} clientId A clientId from the Developer console.
 * @param {string} clientSecret An clientSecret from the Developer console.
 * @returns {Promise} A promise that will be resolved when the loading completed.
 */
Gdfs.loadApi = (clientId, clientSecret) => {
    debug("Start of Gdfs.loadApi");
    const script = document.createElement("SCRIPT");
    script.setAttribute("async", "async");
    script.setAttribute("src", "https://apis.google.com/js/api.js");
    const p = new Promise( (resolve, reject) => {
        script.addEventListener("load", () => {
            script.onload = () => {};
            gapi.load("client:auth2", async () => {
                debug("initialize gapi.client");

                if(typeof(clientId) === "object" && clientSecret == null &&
                    "clientId" in clientId && "clientSecret" in clientId &&
                    "discoveryDocs" in clientId && "scope" in clientId)
                {
                    await gapi.client.init(clientId);
                } else {
                    await gapi.client.init({
                        clientId, clientSecret,
                        discoveryDocs: [
                            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                        ],
                        scope: [
                            "https://www.googleapis.com/auth/drive",
                            "https://www.googleapis.com/auth/drive.appdata",
                            "https://www.googleapis.com/auth/drive.file",
                            "https://www.googleapis.com/auth/drive.metadata",
                            "https://www.googleapis.com/auth/drive.metadata.readonly",
                            "https://www.googleapis.com/auth/drive.photos.readonly",
                            "https://www.googleapis.com/auth/drive.readonly",
                        ].join(" "),
                    });
                }
                gapi.auth2.getAuthInstance().isSignedIn.listen( () => {
                    debug("the signed-in-status changed");
                    Gdfs.signInStatusChangeEvent.fire();
                });
                Gdfs.signInStatusChangeEvent.fire();
                debug(`Gdfs.loadApi SignedIn: ${Gdfs.isSignedIn()}`);
                debug("Gdfs.loadApi is resolved");
                resolve();
            });
        });
        script.addEventListener("readystatechange", () => {
            debug(`readystatechange ${script.readyState}`);
            if(script.readyState === "complete") {
                script.onload();
            }
        });
        script.onerror = event => {
            debug("Gdfs.loadApi is rejected");
            reject(new URIError(
                `The script ${event.target.src} is not accessible.`));
        };
        document.body.appendChild(script);
    });
    debug("End of Gdfs.loadApi");
    return p;
};

/**
 * A mime type of the Google Drive's folder.
 * @type {string}
 */
Gdfs.mimeTypeFolder = "application/vnd.google-apps.folder";

/**
 * Check if gapi was signed in.
 * @returns {boolean} true if gapi is signed in, otherwise false.
 */
Gdfs.isSignedIn = () => {
    return gapi.auth2.getAuthInstance().isSignedIn.get();
};

/**
 * Sign in to Google Drive.
 * @async
 * @returns {undefined}
 */
Gdfs.signIn = async () => {
    return await gapi.auth2.getAuthInstance().signIn();
};

/**
 * Sign out from the Google Drive.
 * @async
 * @returns {undefined}
 */
Gdfs.signOut = async () => {
    return await gapi.auth2.getAuthInstance().signOut();
};

/**
 * Get file list.
 * @async
 * @param {object} queryParameters The parameters for the API.
 * @returns {Promise<object>} The result of the API.
 */
Gdfs.getFileList = async (queryParameters) => {
    const response = await gapi.client.drive.files.list(queryParameters);
    return response.result;
};

/**
 * Find a folder by name from a folder.
 * @async
 * @param {string} parentFolderId A parent folder id.
 * @param {string} folderName A folder name to find
 * @returns {Array<object>} A folder list that found.
 */
Gdfs.findFolderByName = async (parentFolderId, folderName) => {
    debug("No tests pass: Gdfs.findFolderByName");

    const folders = [];
    const q = [
        `parents in '${parentFolderId}'`,
        `name = '${folderName}'`,
        `mimeType = '${Gdfs.mimeTypeFolder}'`,
        "trashed = false",
    ].join(" and ");

    const params = {
        "pageSize": 10,
        "pageToken": null,
        "q": q,
        "fields": "nextPageToken, " +
                  "files(id, name, mimeType, webContentLink, webViewLink)",
    };

    debug(`${JSON.stringify(params)}`);
    try {
        do {
            const result = await Gdfs.getFileList(params);
            debug(`${JSON.stringify(result)}`);
            for(const file of result.files) {
                folders.push(file);
            }
            params.pageToken = result.nextPageToken;
        } while(params.pageToken != null);
    } catch(err) {
        debug(err.stack);
    }

    return folders;
};

/**
 * Find a file by name from a folder.
 * @async
 * @param {string} parentFolderId A parent folder id.
 * @param {string} fileName A file name to find
 * @returns {Promise<Array<object> >} A folder list that found.
 */
Gdfs.findFileByName = async (parentFolderId, fileName) => {
    debug("No tests pass: Gdfs.findFileByName");

    const files = [];
    const q = [
        `parents in '${parentFolderId}'`,
        `name = '${fileName}'`,
        "trashed = false",
    ].join(" and ");

    const params = {
        "pageSize": 10,
        "pageToken": null,
        "q": q,
        "fields": "nextPageToken, " +
                  "files(id, name, mimeType, webContentLink, webViewLink)",
    };

    debug(`findFileByName: params: ${JSON.stringify(params, null, "  ")}`);
    do {
        const result = await Gdfs.getFileList(params);
        for(const file of result.files) {
            debug(`findFileByName: found file: ${JSON.stringify(file)}`);
            files.push(file);
        }
        debug(`findFileByName: result.nextPageToken: ${result.nextPageToken}`);
        params.pageToken = result.nextPageToken;
    } while(params.pageToken != null);

    return files;
};

/**
 * Get file resource.
 * @async
 * @param {object} queryParameters The parameters for the API.
 * @returns {Promise<object>} The result of the API.
 */
Gdfs.getFileResource = async (parameters) => {
    const response = await gapi.client.drive.files.get(parameters);
    return response.result;
};

/**
 * Check if the file is a folder.
 * @param {object} file The file object provided from the result
 * of `getFileList` method.
 * @returns {boolean} The file is a folder or not.
 */
Gdfs.isFolder = (file) => {
    return file.mimeType === Gdfs.mimeTypeFolder;
};

/**
 * Get a file content as text from Google Drive.
 * Even if the file is not a text actually, it could be converted
 * to ArrayBuffer, Blob or JSON to use by Web App.
 * @param {string} fileId The file id to download.
 * @param {boolean|null} acknowledgeAbuse A user acknowledgment
 * status for the potential to abuse. This parameter is optional.
 * default value is false.
 * @returns {Promise<string>} A downloaded content as text.
 */
Gdfs.downloadFile = (fileId, acknowledgeAbuse) => {
    return requestWithAuth("GET",
        "https://www.googleapis.com/drive/v3/files/"+fileId,
        { alt: "media", acknowledgeAbuse : acknowledgeAbuse });
};

/**
 * Create a new file's resource.
 * @param {string} folderId The folder id where the file is created.
 * @param {string} filename The file name.
 * @param {string} mimeType The mime type for the new file.
 * @returns {Promise<object>} The response of the API.
 */
Gdfs.createFile = async (folderId, filename, mimeType) => {
    const response = await requestWithAuth("POST",
        "https://www.googleapis.com/drive/v3/files", {},
        { "Content-Type": "application/json", },
        JSON.stringify({
            name: filename,
            mimeType: mimeType,
            parents: [folderId],
        }));
    return JSON.parse(response);
};

/**
 * Upload a file content to update a existing file.
 * @param {string} fileId The file id to update.
 * @param {string} mimeType The content type of the file.
 * @param {any} data The file content.
 * @returns {Promise<object>} The response of the API.
 */
Gdfs.updateFile = async (fileId, mimeType, data) => {
    const response = await requestWithAuth("PATCH",
        "https://www.googleapis.com/upload/drive/v3/files/"+fileId,
        { uploadType: "media" },
        { "Content-Type": mimeType },
        data);
    return JSON.parse(response);
};

/**
 * @param {string} method The request method.
 * @param {string} endpoint The endpoint of API.
 * @param {object} queryParams The query parameters.
 * @param {object} headers The request headers.
 * @param {any} body The request body.
 * @returns {Promise<object>} The response of the request.
 */
const requestWithAuth = (method, endpoint, queryParams, headers, body) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, createUrl(endpoint, queryParams), true);
    headers = headers || {};
    Object.keys(headers).forEach( name => {
        xhr.setRequestHeader(name, headers[name]);
    });
    xhr.setRequestHeader("Authorization",
        "Bearer " + getAccessToken());
    xhr.timeout = 30000;
    return new Promise( (resolve, reject) => {
        xhr.onload = () => { resolve(xhr.responseText); };
        xhr.onerror = () => { reject(new Error(xhr.statusText)); };
        xhr.ontimeout = () => { reject(new Error("request timeout")); };
        xhr.send(body);
    });
};

/**
 * Get access-token on current session.
 * @returns {string} The access token.
 */
const getAccessToken = () => {
    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    const authResponse = googleUser.getAuthResponse(true);
    const accessToken = authResponse.access_token;
    return accessToken;
};

/**
 * Create URI including query parameters.
 * @param {string} endpoint The endpoint of API.
 * @param {object|null} params The query parameters.
 * @returns {string} The URI.
 */
const createUrl = (endpoint, params) => {
    if(params == null) {
        return endpoint;
    }
    let keys = Object.keys(params).filter(
        key => (key !== ""));
    if(keys.length == 0) {
        return endpoint;
    }
    let queryString = keys.map( key => {
        let value = params[key];
        return (value == null ? null : `${key}=${encodeURI(value)}`);
    }).join("&");
    return `${endpoint}?${queryString}`;
};

/**
 * Get actual root folder id.
 * @async
 * @return {Promise<string>} The root folder's id
 */
Gdfs.getActualRootFolderId = async () => {
    const res = await Gdfs.getFileResource({ fileId: "root", fields: "id" });
    debug(`getActualRootFolderId: res ${JSON.stringify(res, null, "  ")}`);
    return res.id;
};

/**
 * Set oncwdchage callback hander.
 * @param {FUnction|AsyncFunction} handler a function to be invoked when
 *      the current directory is changed.
 * @returns {undefined|Function} the previous handler will be returned.
 */
Gdfs.prototype.onCwdUpdate = function(handler) {
    const prev = this._oncwdupdate;
    if(handler != null) {
        this._oncwdupdate = handler;
    }
    return prev;
};

/**
 * Fire cwdUpdate.
 * @returns {Promise} what the handler returns.
 */
Gdfs.prototype.fireCwdUpdate = async function() {
    if(this._oncwdupdate) {
        try {
            const result = this._oncwdupdate();
            if(result != null) {
                if(result.constructor === Promise) {
                    return await result;
                }
                return result;
            }
        } catch (err) {
            debug(err.stack);
        }
    }
};

/**
 * Get current folder id.
 * @returns {string} The folder id that the instance is.
 */
Gdfs.prototype.getCurrentFolderId = function() {
    return this._currentPath.slice(-1)[0].id;
};

/**
 * Get current working directory as path object.
 * @returns {GdfsPath} the current working directory.
 */
Gdfs.prototype.getCurrentPath = function() {
    const path = this._currentPath.map( path => `${path.name}/`).join("");
    const cwd = new GdfsPath(path);
    debug(`getCurrentPath: ${cwd.toString()}`);
    return cwd;
};

/**
 * Set current working directory with path object.
 * @async
 * @param {GdfsPath} path the new current working directory.
 * @returns {Promise<boolean>} the status of the operation.
 */
Gdfs.prototype.setCurrentPath = async function(path) {
    debug("No tests pass: Gdfs#setCurrentPath");
    debug(`setCurrentPath(${path})`);
    if(!path.isAbsolute()) {
        debug(`The path must be absolute. ${path}`);
        return false;
    }
    if(!(await this.isDirectory(path))) {
        debug(`${path} is not a directory`);
        return false;
    }
    this._currentPath = await this.getPaths(path);
    await this.fireCwdUpdate();
    return true;
};

/**
 * Get an array of path element from root directory.
 * @async
 * @param {GdfsPath} path path object.
 * @returns {Promise<Array<object> >} the array of the object having an id and
 *      the name.
 */
Gdfs.prototype.getPaths = async function(path) {
    debug("No tests pass: Gdfs#getPaths");
    debug(`getPaths(${path})`);
    if(!path.isAbsolute()) {
        debug("getPaths: Error: the path must be absolute");
        return null;
    }
    const paths = [ { id:"root", name:"", mimeType: Gdfs.mimeTypeFolder } ];
    for(const name of path.elements().slice(1)) {
        if(name === "") {
            break;
        }
        const parent = paths.slice(-1)[0];
        debug(`name: ${name}, parent: ${JSON.stringify(parent)}`);
        const path = { id: null, name: null, mimeType: null };
        if(parent.id != null) {
            const children = await Gdfs.findFileByName(parent.id, name);
            if(children.length > 0) {
                const child = children.shift();
                path.id = child.id;
                path.name = child.name;
                path.mimeType = child.mimeType;
            }
        }
        paths.push(path);
    }
    debug(`getPaths: ${JSON.stringify(paths, null, "  ")}`);
    return paths;
};

/**
 * Get the file object that the path points to.
 * @param {GdfsPath} path the path.
 * @returns {file} the file object of google drive.
 */
Gdfs.prototype.getFileOfPath = async function(path) {
    const paths = await this.getPaths(path);
    if(!paths) {
        return null;
    }
    return paths.slice(-1)[0];
};

/**
 * Get the current working directory of gdrive-fs.
 * @returns {string} The current working directory.
 */
Gdfs.prototype.cwd = function() {
    return this.getCurrentPath().toString();
};

/**
 * Changes the current working directory of this client session.
 * @param {string} directory A pathname to operate.
 * @async
 * @returns {Promise<boolean>} the status of the operation.
 */
Gdfs.prototype.chdir = async function(directory) {
    debug("No tests pass: Gdfs#chdir");
    const cwd = this.getCurrentPath();
    const next_cwd = GdfsPath.merge(cwd, new GdfsPath(directory));
    return await this.setCurrentPath(next_cwd);
};

/**
 * Move current directory to root, parent or one of children.
 * @async
 * @param {string} folderId A destination file id to move.
 *      To move to parent, ".." is available.
 * @returns {Promise<boolean>} the status of the operation.
 */
Gdfs.prototype.chdirById = async function(folderId) {
    debug(`Gdfs.chdirById( ${folderId} )`);
    if(folderId === ".") {
        return true;
    }
    const currentFolderId = this.getCurrentFolderId();
    if(folderId === "/" || folderId === "root" ) {
        this._currentPath = [ { id:"root", name:"" } ];
        await this.fireCwdUpdate();
    } else if(folderId === "..") {
        if(currentFolderId === "root") {
            debug("Could not move to upper folder from root.");
            return false;
        }
        this._currentPath.pop();
        await this.fireCwdUpdate();
    } else if(folderId !== currentFolderId) {
        const paths = [];
        const root = await Gdfs.getFileResource({fileId: "root", fields: "id"});
        let searchId = folderId;
        for(;;) {
            const file = await Gdfs.getFileResource({
                fileId: searchId,
                fields: "id, name, parents, mimeType",
            });
            if(file == null) {
                debug(`folder ${searchId} is not found.`);
                return false;
            }
            if(file.mimeType !== Gdfs.mimeTypeFolder) {
                debug(`folder ${searchId} is not folder.`);
                return false;
            }
            debug(JSON.stringify(file, null,  "  "));
            if(file.id == root.id) {
                paths.unshift({id: "root", name: "" });
                break;
            } else {
                paths.unshift({id: file.id, name: file.name });
            }
            searchId = file.parents.shift();
        }
        debug(JSON.stringify(paths, null, "  "));
        this._currentPath = paths;
        await this.fireCwdUpdate();
    }
    return true;
};

/**
 * Check the path is a directory.
 * @async
 * @param {GdfsPath} path A path to check
 * @returns {Promise<Boolean>} The path is a directory or not.
 */
Gdfs.prototype.isDirectory = async function(path) {
    debug("No tests pass: Gdfs#isDirectory");
    const file = await this.getFileOfPath(this.toAbsolutePath(path));
    if(!file) {
        return false;
    }
    return file.mimeType === Gdfs.mimeTypeFolder;
};

/**
 * Convert to absolute path.
 * @param {GdfsPath} path path to be converted
 * @returns {GdfsPath} An absolute path
 */
Gdfs.prototype.toAbsolutePath = function(path) {
    debug("No tests pass: Gdfs#toAbsolutePath");
    if(path.isAbsolute()) {
        return path;
    }
    const cwd = this.getCurrentPath();
    return GdfsPath.merge(cwd, path);
};

/**
 * Read the directory to get a list of filenames.
 *
 * This method may not returns all files in the directory.
 * To know all files were listed, check the `pageToken` field in the parameter
 * `options` after the invocation.
 * If the reading was completed, the field would be set `null`.
 * The rest files unread will be returned at the next invocation with same
 * parameters.
 *
 * ```javascript
 * const readDirAll = async path => {
 *     const opts = { pageSize: 10, pageToken: null };
 *     const files = [];
 *     do {
 *        for(const fn of await files.readdir(path, opts)) {
 *            files.push(fn);
 *        }
 *     } while(opts.pageToken != null);
 * };
 * ```
 *
 * @async
 * @since v1.1.0
 * @param {string} path A path to the directory.
 *
 * @param {object|null} options (Optional) options for this method.
 *
 * Only two fields are available:
 *
 * * "pageSize": Set maximum array size that this method returns at one
 * time.  The default value 10 will be used if this is not specified or
 * zero or negative value is specified.
 * * "pageToken": Set null to initial invocation to read from first
 * entry. This would be updated other value if the unread files are
 * remained. The value is used for reading next files. User should not
 * set the value except for null.
 *
 * If this parameter is ommited, all files will be read.
 * This is not recomended feature for the directory that has a number of files.
 *
 * @returns {Promise<Array<string> >} returns an array of filenames.
 */
Gdfs.prototype.readdir = async function(path, options) {
    path += path.match(/\/$/) ? "" : "/";
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`readdir: parentFolder: ${JSON.stringify(parentFolder)}`);

    if(!parentFolder || parentFolder.id == null) {
        debug(`readdir: The path not exists ${path}`);
        return null;
    }

    if(!Gdfs.isFolder(parentFolder)) {
        debug(`readdir: The path is not a folder ${path}`);
        return null;
    }

    const files = [];
    const readAll = (options == null);
    options = options || {};
    const pageSize = options.pageSize || 10;
    let pageToken = options.pageToken || null;

    const readFiles = async params => {
        debug(`readdir: params: ${JSON.stringify(params, null, "  ")}`);
        const result = await Gdfs.getFileList(params);
        debug(`readdir: result.nextPageToken: ${result.nextPageToken}`);
        for(const file of result.files) {
            files.push(file.name);
        }
        return result.nextPageToken;
    };

    const params = {
        "pageSize": pageSize <= 0 ? 10 : pageSize,
        "pageToken": pageToken,
        "q": `parents in '${parentFolder.id}' and trashed = false`,
        "fields": "nextPageToken, files(name)",
    };

    if(!readAll) {
        // eslint-disable-next-line require-atomic-updates
        options.pageToken = await readFiles(params);
    } else {
        do {
            // eslint-disable-next-line require-atomic-updates
            options.pageToken = await readFiles(params);
        } while(options.pageToken != null);
    }

    debug(`readdir: files: ${JSON.stringify(files)}`);
    return files;
};

/**
 * Get file's properties.
 * It is a file resource of Google Drive including id, name, mimeType,
 * webContentLink and webViewLink about the file or directory.
 *
 * @async
 * @param {string} path A pathname.
 * @returns {File} The file resource of Google Drive including id, name,
 *      mimeType, webContentLink and webViewLink about the file or directory.
 * @since v1.1.0
 */
Gdfs.prototype.stat = async function(path) {
    debug(`Gdfs#stat(${path})`);
    path = path.replace(/\/+$/, "");
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    debug(`stat: absPath: ${absPath.toString()}`);
    path = absPath.toString();
    if(path === "/") {
        const file = await Gdfs.getFileResource({
            fileId: "root",
            fields: "id, name, mimeType, webContentLink, webViewLink",
        });
        debug(`stat: file ${JSON.stringify(file)}`);
        return file;
    }
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`stat: parentFolder: ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`stat: The path not exists ${path}`);
        return null;
    }
    const filename = absPath.getFilename();
    debug(`stat: filename: ${filename}`);
    const files = await Gdfs.findFileByName(parentFolder.id, filename);
    if(files.length === 0) {
        debug(`stat: File not found ${path}`);
        return null;
    }
    const file = files.shift();
    debug(`stat: file ${JSON.stringify(file)}`);
    return file;
};

/**
 * Read a file.
 * The file must have webContentLink in its resource to read the contents,
 * To get the resource, Use [`Gdfs#stat`](#stat).
 *
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<string>} The file content.
 */
Gdfs.prototype.readFile = async function(path) {
    debug(`Gdfs#readFile(${path})`);
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`readFile: parentFolder: ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`readFile: The path not exists ${path}`);
        return null;
    }
    const filename = absPath.getFilename();
    debug(`readFile: filename: ${filename}`);
    const files = await Gdfs.findFileByName(parentFolder.id, filename);
    debug(`readFile: files: ${JSON.stringify(files)}`);
    if(files.length === 0) {
        debug(`File not found ${path}`);
        return null;
    }
    const file = files.shift();
    if(!file.webContentLink) {
        debug(`File is not downloadable ${path}`);
        return null;
    }
    return await Gdfs.downloadFile(file.id);
};

/**
 * Make a directory.
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object>} The API response.
 */
Gdfs.prototype.mkdir = async function(path) {
    debug(`mkdir(${path})`);

    path = path.replace(/\/+$/, "");
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`mkdir: parentFolder ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`mkdir: The path not exists ${path}`);
        return null;
    }
    const pathname = absPath.getFilename();
    debug(`mkdir: pathname: ${pathname}`);
    const files = await Gdfs.findFileByName(parentFolder.id, pathname);
    debug(`mkdir: files: ${JSON.stringify(files)}`);
    if(files.length > 0) {
        debug(`mkdir: The directory exists ${path}`);
        return null;
    }
    const result = await Gdfs.createFile(
        parentFolder.id, pathname, Gdfs.mimeTypeFolder);
    if(parentFolder.id === this.getCurrentFolderId()) {
        await this.fireCwdUpdate();
    }
    return result;
};

/**
 * Remove the directory but not a normal file.
 * The operation will fail, if it is not a directory nor empty.
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object|null>} Returns the API response.
 *      null means it was failed.
 */
Gdfs.prototype.rmdir = async function(path) {
    debug(`rmdir(${path})`);
    path = path.replace(/\/+$/, "");
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`rmdir: parentFolder ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`rmdir: The path not exists ${path}`);
        return null;
    }
    const pathname = absPath.getFilename();
    debug(`rmdir: pathname: ${pathname}`);
    if(pathname === "") {
        debug(`rmdir: The root directory cannot be removed ${path}`);
        return null;
    }
    const dires = await Gdfs.findFolderByName(parentFolder.id, pathname);
    debug(`rmdir: dires: ${JSON.stringify(dires)}`);
    if(dires.length === 0) {
        debug(`rmdir: The directory not exists ${path}`);
        return null;
    }
    const dir = dires.shift();
    debug(`rmdir: dir ${JSON.stringify(dir)}`);
    debug(`rmdir: _currentPath ${JSON.stringify(this._currentPath, null, "  ")}`);
    if(this._currentPath.filter(parent => parent.id == dir.id).length > 0 ||
        dir.id === await Gdfs.getActualRootFolderId())
    {
        debug(`rmdir: The path is a parent ${path}`);
        return null;
    }
    if(dir.mimeType !== Gdfs.mimeTypeFolder) {
        debug(`rmdir: The path is not folder ${path}`);
        return null;
    }
    const params = {
        "q": `parents in '${dir.id}' and trashed = false`,
        "fields": "files(id)",
    };
    debug(`rmdir: params ${JSON.stringify(params)}`);
    const children = await Gdfs.getFileList(params);
    debug(`rmdir: children: ${JSON.stringify(children, null, "  ")}`);
    if(children.files.length > 0) {
        debug(`rmdir: The folder is not empty ${path}`);
        return null;
    }
    const response = await gapi.client.drive.files.delete(
        { fileId: dir.id });
    if(parentFolder.id === this.getCurrentFolderId()) {
        await this.fireCwdUpdate();
    }
    return response.result;
};

/**
 * Delete the file but not directory.
 * This does not move the file to the trash-box.
 *
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object|null>} Returns the API response.
 *      null means it was failed.
 */
Gdfs.prototype.unlink = async function(path) {
    debug(`unlink(${path})`);
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`unlink: parentFolder ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`unlink: The path not exists ${path}`);
        return null;
    }
    const pathname = absPath.getFilename();
    debug(`unlink: pathname: ${pathname}`);
    const files = await Gdfs.findFileByName(parentFolder.id, pathname);
    debug(`unlink: files: ${JSON.stringify(files)}`);
    if(files.length === 0) {
        debug(`unlink: The file not exists ${path}`);
        return null;
    }
    const file = files.shift();
    if(file.mimeType === Gdfs.mimeTypeFolder) {
        debug(`unlink: The file is a folder ${path}`);
        return null;
    }
    const response = await gapi.client.drive.files.delete({ fileId: file.id });
    const result = response.result;
    if(parentFolder.id === this.getCurrentFolderId()) {
        await this.fireCwdUpdate();
    }
    return result;
};

/**
 * Write a file.
 * @async
 * @param {string} path A pathname to operate.
 * @param {string} mimeType A mimeType of the file content.
 * @param {string} data A file content.
 * @returns {Promise<object>} The API response.
 */
Gdfs.prototype.writeFile = async function(path, mimeType, data) {
    debug(`Gdfs#writeFile(${path},${mimeType}, ${JSON.stringify(data)})`);
    const absPath = this.toAbsolutePath(new GdfsPath(path));
    const parentFolder = await this.getFileOfPath(absPath.getPathPart());
    debug(`writeFile: parentFolder: ${JSON.stringify(parentFolder)}`);
    if(!parentFolder || parentFolder.id == null) {
        debug(`writeFile: The path not exists ${path}`);
        return null;
    }
    const filename = absPath.getFilename();
    debug(`writeFile: filename: ${filename}`);
    const files = await Gdfs.findFileByName(parentFolder.id, filename);
    debug(`writeFile: files: ${JSON.stringify(files)}`);
    if(files.length === 0) {
        const file = await Gdfs.createFile(
            parentFolder.id, filename, mimeType);
        const result = await Gdfs.updateFile(file.id, mimeType, data);
        if(parentFolder.id === this.getCurrentFolderId()) {
            await this.fireCwdUpdate();
        }
        return result;
    }
    const file = files.shift();
    if(file.mimeType === Gdfs.mimeTypeFolder) {
        debug(`writeFile: The path already exists as directory ${path}`);
        return null;
    }
    const result = await Gdfs.updateFile(file.id, mimeType, data);
    if(parentFolder.id === this.getCurrentFolderId()) {
        await this.fireCwdUpdate();
    }
    return result;
};

module.exports = Gdfs;
