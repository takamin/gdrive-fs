"use strict";
const debug = require("debug")("gdfs-ui");
debug("loading");
const Gdfs = require("./gdfs.js");
const GdfsEvent = require("./gdfs-event.js");

/**
 * class GdfsUi
 * @constructor
 * @param {HTMLElement} The root element that UI widget will be built.
 * @param {Gdfs} The gapi client.
 */
function GdfsUi(element, opt) {
    debug("Start of GdfsUi ctor");
    this._element = element;
    this._gdfs = new Gdfs();
    this._pageSize = 10;
    this._trashed = false;
    this._pageToken = null;
    this._files = [];
    this._opt = {
        onFileListChange: () => {},
        onCurrentDirChange: () => {},
    };

    opt = opt || {};
    for(const key of Object.keys(this._opt)) {
        if(key in opt) {
            this._opt[key] = opt[key];
        }
    }

    // events
    this._fileListChangeEvent = new GdfsEvent(
        this._element, "gdfsui-filelist-change");
    this._currentDirChangeEvent = new GdfsEvent(
        this._element, "gdfsui-current-dir-change");

    this._currentDirChangeEvent.listen(
        this._opt.onCurrentDirChange);
    this._fileListChangeEvent.listen(
        this._opt.onFileListChange);

    this._gdfs.onCwdUpdate(async () => {
        debug("Start of _gdfs.onCwdUpdate");
        await this.reload();
        this._currentDirChangeEvent.fire();
        debug("End of _gdfs.onCwdUpdate");
    });

    const onSignedInStatusChange = async status => {
        debug("Start of signInStatusChange");
        if(status) {
            await this._gdfs.chdir("/");
        }
        debug("End of signInStatusChange");
    };

    // Listen events
    Gdfs.signInStatusChangeEvent.listen(
        () => onSignedInStatusChange(Gdfs.isSignedIn()));

    onSignedInStatusChange(Gdfs.isSignedIn());
    debug("End of GdfsUi ctor");
}

/**
 * Returns the listing files in current directory is completed.
 * @returns {boolean} true if the listing files is completed.
 */
GdfsUi.prototype.isPageCompleted = function() {
    const status = this._pageToken == null;
    return status;
};

/**
 * Get current path as full path.
 * @returns {Array<string>} The array of file ids.
 */
GdfsUi.prototype.getCurrentPath = function() {
    return this._gdfs._currentPath;
};

/**
 * Get files list on current page.
 * @param {number} begin a file index
 * @param {number} end a file index
 * @returns {Array<File>} the files in current page.
 */
GdfsUi.prototype.getFiles = async function(begin, end) {
    debug(`GdfsUi#getFiles param:{begin:${begin}, end:${end})}`);
    debug(`_pageToken: ${this._pageToken}`);
    if(this._pageToken == null) {
        this._files = [];
    }
    while(end > this._files.length) {
        await this.readDir();
        this._fileListChangeEvent.fire();
        if(this._pageToken == null) {
            break;
        }
    }
    return this._files.slice(begin, end);
};

/**
 * Read the files on current directory.
 * @async
 * @returns {Promise<undefined>}
 */
GdfsUi.prototype.readDir = async function() {

    const andConditionsOfQuerySearchClauses = [
        `parents in '${this._gdfs.getCurrentFolderId()}'`,
        `trashed = ${this._trashed?"true":"false"}`,
    ];

    const queryParameters = {
        "pageSize": this._pageSize,
        "pageToken": this._pageToken,
        "q": andConditionsOfQuerySearchClauses.join(" and "),
        "fields": "nextPageToken, files(id, name, mimeType, webContentLink, webViewLink)",
    };

    const result = await Gdfs.getFileList(queryParameters);
    this._pageToken = result.nextPageToken;
    for(const file of result.files) {
        this._files.push(file);
    }
};

/**
 * Reload the file list.
 * @async
 * @returns {Promise} to sync
 */
GdfsUi.prototype.reload = async function() {
    this._pageToken = null;
    this._files = [];
    await this.readDir();
    this._fileListChangeEvent.fire();
};

/**
 * Move current directory to root, parent or one of children.
 * @param {string} folderId A destination file id to move.
 * To move to parent, ".." is available.
 * @returns {Promise<undefined>}
 */
GdfsUi.prototype.chdirById = async function(folderId) {
    await this._gdfs.chdirById(folderId);
};

/**
 * Get file resource.
 * @async
 * @param {string} fileId The file id of the target file.
 * @returns {Promise<object>} The resource object.
 */
GdfsUi.prototype.getFileResource = async function(fileId) {
    return await Gdfs.getFileResource({
        "fileId": fileId,
    });
};

/**
 * Upload a file.
 * @param {File} file the file to be uploaded.
 * @return {Promise<File>} an uploaded File.
 */
GdfsUi.prototype.uploadFile = function (file) {
    return new Promise( (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            resolve(await this.writeFile(
                file.name, file.type, reader.result));
        };
        reader.onerror = event => {
            reject(new Error([
                "Fail to upload. Could not read the file ",
                `${file.name}(${event.type}).`,
            ].join("")));
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Create or overwrite a file to current directory.
 * @param {string} filename The file name.
 * @param {string} mimeType The content type.
 * @param {any} data The file content.
 * @returns {Promise<object>} The response of update.
 */
GdfsUi.prototype.writeFile = async function (
    filename, mimeType, data)
{
    // Find same file in current directory
    const fileIds = this._files
        .filter(file => (file.name === filename))
        .map( file => file.id );

    if(fileIds.length == 0) {
        //Create new file
        const response = await Gdfs.createFile(
            this._gdfs.getCurrentFolderId(), filename, mimeType);
        const file = JSON.parse(response);
        return await Gdfs.updateFile(
            file.id, mimeType, data);
    }

    // Overwrite the file
    return await Gdfs.updateFile(
        fileIds[0], mimeType, data);
};

module.exports = GdfsUi;
