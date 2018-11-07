"use strict";
const debug = require("debug")("*");
debug("loading");
const Gdfs = require("../index.js");
const DOM = require("../lib/gdfs-dom-helper.js");
function FileList(element) {
    debug("Start of FileList");
    this._element = element;
    this._pageSize = 10;
    this._currentPage = 0;
    this._selectedFile = null;
    this._btnPagePrev = DOM.createButton("Prev",
        {disabled: "disabled"},
        async () => {
            debug("*** btnPagePrev ***");
            await this.listFiles(this._currentPage - 1);
        });
    this._btnPageNext = DOM.createButton("Next",
        {disabled: "disabled"},
        async () => {
            debug("*** btnPageNext ***");
            await this.listFiles(this._currentPage + 1);
        });
    this._btnWebView = DOM.createButton("Open", () => {
        debug("*** open the file ***");
        const w = window.open("about:blank");
        w.location.href = this._selectedFile.webViewLink;
    });
    this._btnDownloadFile = DOM.createButton("Download", () => {
        debug("*** download the file ***");
        window.location.href = this._selectedFile.webContentLink;
    });
    this._btnReadFile = DOM.createButton("Read", async () => {
        debug("*** read the file ***");
        try {
            const result = await Gdfs.downloadFile(this._selectedFile.id);
            debug(result);
        } catch(err) {
            debug(err.message);
        }
    });
    this._btnCdParent = DOM.createButton("..", {disabled: "disabled"},
        () => {
            debug("*** cd to the parent dir ***");
            this._gdfsUi.chdirById("..");
        });

    this._filelist = DOM.createElement("OL", {"class": "filelist"});
    for(let i = 0; i < this._pageSize; i++) {
        this._filelist.appendChild(
            DOM.createElement("LI", {"class": `item file-${i} empty`}));
    }

    while(this._element.firstChild) {
        this._element.removeChild(this._element.firstChild);
    }

    DOM.append(this._element,
        "<img src='https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder'/> ",
        "<span class='pankuzu'></span>",
        " Page: ", this._btnPagePrev, this._btnPageNext, this._btnCdParent,
        this._filelist,
        this._btnWebView, this._btnDownloadFile, this._btnReadFile,
    );

    // Allow to drop files to store to the current directory.
    this._element.addEventListener("dragover", event => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    });
    this._element.addEventListener("drop", async event => {
        event.stopPropagation();
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const result = await Promise.all(files.map( file => {
            return this._gdfsUi.uploadFile(file);
        }));
        debug(JSON.stringify(result));
        this._currentPage = 0;
        await this._gdfsUi.reload();
    });

    const onCurrentDirChange = async () => {
        this.updatePankuzu();
        this.selectFile(null);
        await this.listFiles(0);
    };
    this._gdfsUi = new Gdfs.Ui(this._element, {
        onFileListChange: () => {
            debug("Start of onFileListChange");
            this.updatePankuzu();
            this.updateButtons();
            debug("End of onFileListChange");
        },
        onCurrentDirChange: async () => {
            debug("Start of onCurrentDirChange");
            onCurrentDirChange();
            debug("End of onCurrentDirChange");
        },
    });

    const commandPanel = DOM.createElement("DIV", {"class": "commandPanel"});
    this._element.appendChild(commandPanel);
    this.createCommandPanel(commandPanel);

    debug("End of FileList");
}

FileList.prototype.selectFile = async function(file) {
    this._selectedFile = file;
    this.updateSelectedFileButtons();
};

FileList.prototype.updateSelectedFileButtons = async function() {
    DOM.disableButton(this._btnWebView,
        !this._selectedFile || !("webViewLink" in this._selectedFile));
    DOM.disableButton(this._btnDownloadFile,
        !this._selectedFile || !("webContentLink" in this._selectedFile));
    DOM.disableButton(this._btnReadFile,
        !this._selectedFile || !("webContentLink" in this._selectedFile));
};

FileList.prototype.updateButtons = function() {
    debug("FileList#updateButtons start");
    const noPrevPage = (this._currentPage === 0);
    const nextPageIndex = this._currentPage + 1;
    const fileCount = this._gdfsUi._files.length;
    const fileIndexOfNextPage = nextPageIndex * this._pageSize;
    const listCompleted = this._gdfsUi.isPageCompleted();
    const noNextPage = listCompleted && fileIndexOfNextPage >= fileCount;
    DOM.disableButton(this._btnPagePrev, noPrevPage);
    DOM.disableButton(this._btnPageNext, noNextPage);

    // Update button to move parent directory
    const path = this._gdfsUi.getCurrentPath();
    debug(`cwd: ${JSON.stringify(path)}`);
    DOM.disableButton(this._btnCdParent, path.length <= 1);

    debug("FileList#updateButtons end");
};

FileList.prototype.updatePankuzu = function() {
    debug("Start of updatePankuzu");
    const pankuzu = this._element.querySelector(".pankuzu");
    try {
        const path = this._gdfsUi.getCurrentPath();
        const pankuzuItems = path.map(file => DOM.createElement("A",
            { href:"javascript:void(0);" },
            (file.id === "root" ? "/" : file.name),
            { "click": () => this._gdfsUi.chdirById(file.id) })
        );
        insertBetweenEachItem(pankuzuItems, () => DOM.text(" / "));
        while(pankuzu.firstChild) {
            pankuzu.removeChild(pankuzu.firstChild);
        }
        for(const content of pankuzuItems) {
            pankuzu.appendChild(content);
        }

    } catch(err) {
        console.error(err.stack);
    }
    debug("End of updatePankuzu");
};

FileList.prototype.listFiles = async function(page) {
    debug(`listFiles page: ${page}`);
    page = page || 0;
    this._currentPage = page;

    const begin = this._currentPage * this._pageSize;
    debug(`begin: ${begin}`);
    debug(`_pageSize: ${this._pageSize}`);
    const files = await this._gdfsUi.getFiles(begin, begin + this._pageSize);
    debug(`listFiles: ${files.length} files`);
    for(let i = 0; i < this._pageSize; i++) {
        const li = this._filelist.querySelector(`.file-${i}`);
        li.classList.remove("folder");
        li.classList.remove("file");
        li.classList.remove("empty");
        if(i < files.length) {
            const file = files[i];
            li.style.listStyleImage = `url(${file.iconLink})`;
            if(Gdfs.isFolder(file)) {
                li.classList.add("folder");
                li.innerHTML = `[${file.name}/]`;
                li.onclick = async () => {
                    debug(`*** cd to ${file.name}#${file.id} ***`);
                    await this._gdfsUi.chdirById(file.id);
                };
            } else {
                li.innerHTML = file.name;
                li.classList.add("file");
                li.onclick = async () => {
                    this.selectFile(file);
                };
            }
        } else {
            li.style.listStyleImage = null;
            li.classList.add("empty");
            li.innerHTML = "&nbsp;";
            li.onclick = () => {};
        }
    }
    this.updateButtons();
};

const insertBetweenEachItem = (array, createValue) => {
    for(let i = array.length - 1; i > 0; i--) {
        array.splice(i,0, createValue(i, array) );
    }
};

FileList.prototype.createCommandPanel = function(root) {
    createExecuter(root, "Gdfs#chdir",
        [{name:"path","type":"string"}],
        async path => {
            return await this._gdfsUi._gdfs.chdir(path);
        }
    );
    createExecuter(root, "Gdfs#cwd", [], () => this._gdfsUi._gdfs.cwd());
    createExecuter(root, "Gdfs#getCurrentFolderId", [],
        () => this._gdfsUi._gdfs.getCurrentFolderId());
    createExecuter(root, "Gdfs#getCurrentPath", [],
        () => JSON.stringify(this._gdfsUi._gdfs.getCurrentPath()));
    createExecuter(root, "Gdfs#isDirectory",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await this._gdfsUi._gdfs.isDirectory(new Gdfs.Path(path))));
    createExecuter(root, "Gdfs#readFile",
        [{name:"path","type":"string"}],
        async path => await this._gdfsUi._gdfs.readFile(path));
    createExecuter(root, "Gdfs#mkdir",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await this._gdfsUi._gdfs.mkdir(path), null, "  "));
    createExecuter(root, "Gdfs#rmdir",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await this._gdfsUi._gdfs.rmdir(path), null, "  "));
    createExecuter(root, "Gdfs#unlink",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await this._gdfsUi._gdfs.unlink(path), null, "  "));
    createExecuter(root, "Gdfs#writeFile", [
        {name:"path","type":"string"},
        {name:"mimeType","type":"string"},
        {name:"data","type":"string"},
    ], async (path, mimeType, data) =>
        await this._gdfsUi._gdfs.writeFile(path, mimeType, data));
    createExecuter(root, "Gdfs#readdir",
        [
            {name:"path","type":"string"},
            {name:"pageSize","type":"integer"},
            {name:"pageToken","type":"string"},
        ],
        async (path, pageSize, pageToken) => {
            const options = ((!pageToken && !pageSize) ? null : {
                pageSize: pageSize,
                pageToken: pageToken ? pageToken : null,
            });
            const files = await this._gdfsUi._gdfs.readdir(path, options);
            const outopts = options || {};
            return {
                result: files,
                pageToken: outopts.pageToken || null,
            };
        }
    );
    createExecuter(root, "Gdfs#stat",
        [{name:"path","type":"string"}],
        async path => await this._gdfsUi._gdfs.stat(path));
    return root;
};

module.exports = FileList;

const createExecuter = (root, name, params, execHandler) => {
    const className = name.replace(/[\s.#[\]<>]/g, "-");
    DOM.append(root,
        `<div class="command ${className}">
            <div class="name">${name}</div>
            <div class="params">
            ${ params.map(param => `
                <div class="param">
                    <div class="name">${param.name}</div>
                    <div class="input">${createInputHTML(param)}</div>
                </div>`).join("")}
            </div>
            <div class="button"><button type="button">Execute</button></div>
            <div class="result"><pre class="result"></pre></div>
        </div>`
    );
    const baseSelector = `.command.${className}`;
    const btnExec = root.querySelector(`${baseSelector} button`);
    const txtResult = root.querySelector(`${baseSelector} pre.result`);

    btnExec.addEventListener("click", async () => {
        const args = params.map(param => {
            switch(param.type) {
            case "string": {
                const inputString = root.querySelector(
                    `${baseSelector} input.${DOM.toName(param.name)}`);
                return inputString.value;
            }
            case "integer": {
                const inputString = root.querySelector(
                    `${baseSelector} input.${DOM.toName(param.name)}`);
                return parseInt(inputString.value);
            }
            default:
                break;
            }
            return null;
        });
        try {
            debug(`Invoke ${name} args: ${JSON.stringify(args)}`);
            const result = execHandler.apply(null, args);
            const setHTML = value => {
                if(typeof(value) === "object") {
                    txtResult.innerHTML = JSON.stringify(value, null, "  ");
                } else {
                    txtResult.innerHTML = value == null ? "(null)" : value;
                }
            };
            if(result == null) {
                setHTML("(undefined)");
            } else if(result.constructor === Promise) {
                setHTML(await result);
            } else {
                setHTML(result);
            }
        } catch(err) {
            debug(err.stack);
        }
    });
};

const createInputHTML = param => {
    const name = DOM.toName(param.name);
    switch(param.type) {
    case "string":
        return `<input name="${name}" class="param ${name}" type="text"/>`;
    default:
        break;
    }
    return `<input name="${name}" class="param ${name}" type="text"/>`;
};


