"use strict";
localStorage.debug = "*";
const debug = require("debug")("gdrive/public/index.js");
debug("loading");
const Cookies = require("js-cookie");
const Gdfs = require("../index.js");

const main = () => {
    const authPanel = document.querySelector("#google-drive-auth-panel");
    const fileDlgs = Array.from(document.querySelectorAll(".gdrive-fs-ui"));

    const txtClientId = createElement("INPUT",
        { "type": "text", "id": "txtClientId", "size": 70, });
    const txtApiKey = createElement("INPUT",
        { "type": "text", "id": "txtApiKey", "size": 40, });
    const clientId = Cookies.get("clientId");
    const clientSecret = Cookies.get("clientSecret");
    if(clientId){
        txtClientId.setAttribute("value", clientId);
    }
    if(clientSecret) {
        txtApiKey.setAttribute("value", clientSecret);
    }
    const btnConnect = createButton("Connect Google Drive API", async () => {
        debug("Connect.click");
        try {
            const clientId = document.querySelector("#txtClientId").value;
            const clientSecret = document.querySelector("#txtApiKey").value;
            debug(`clientId: ${clientId}`);
            debug(`clientSecret: ${clientSecret}`);
            createAuthPanel(authPanel, fileDlgs);
            await Gdfs.loadApi(clientId, clientSecret);
            Cookies.set("clientId", clientId, { "expires" : 365 * 100 });
            Cookies.set("clientSecret", clientSecret, { "expires" : 365 * 100 });
            if(Gdfs.isSignedIn()) {
                for(const element of fileDlgs) {
                    createFileList(element);
                }
            }
        } catch(err) {
            debug(err.stack);
        }
    });
    authPanel.innerHTML = "";
    authPanel.appendChild(text("clientId: "));
    authPanel.appendChild(txtClientId);
    authPanel.appendChild(createElement("BR"));
    authPanel.appendChild(text("clientSecret: "));
    authPanel.appendChild(txtApiKey);
    authPanel.appendChild(createElement("BR"));
    authPanel.appendChild(btnConnect);
};

const createAuthPanel = (authPanel, fileDlgs) => {
    debug("Start of createAuthPanel");
    const btnAuthorize = createButton("Authorize", async () => {
        debug("btnAuthorize.click");
        if(!Gdfs.isSignedIn()) {
            Gdfs.signIn();
        }
    });
    btnAuthorize.style.display = "none";

    const btnSignOut = createButton("Sign Out", () => {
        debug("btnSignOut.click");
        if(Gdfs.isSignedIn()) {
            Gdfs.signOut();
        }
    });
    btnSignOut.style.display = "none";

    authPanel.appendChild(btnAuthorize);
    authPanel.appendChild(btnSignOut);

    // Listen events
    debug("listen signInStatusChange");
    Gdfs.signInStatusChangeEvent.listen(() => {
        debug("signInStatusChange");
        if(Gdfs.isSignedIn()) {
            debug("signed in");
            btnAuthorize.style.display = "none";
            btnSignOut.style.display = "block";
            for(const element of fileDlgs) {
                createFileList(element);
            }
        } else {
            debug("signed out");
            btnAuthorize.style.display = "block";
            btnSignOut.style.display = "none";
            for(const element of fileDlgs) {
                element.innerHTML = "";
            }
        }
    });
    debug("End of createAuthPanel");
};

const createFileList = (element) => {
    debug("Start of createFileList");

    const gdfsUi = new Gdfs.Ui(element, {
        onFileListChange: async () => {
            debug("Start of onFileListChange");
            updateButtons();
            debug("End of onFileListChange");
        },
        onCurrentDirChange: async () => {
            debug("Start of onCurrentDirChange");
            try {
                // Create paths
                const path = gdfsUi.getCurrentPath();
                const pankuzuItems = path.map(file => createElement("A",
                    { href:"javascript:void(0);" },
                    (file.id === "root" ? "(root)" : file.name),
                    { "click": async () => await gdfsUi.chdirById(file.id) })
                );
                insertBetweenEachItem(pankuzuItems, () => text(" / "));

                debug("CurrentDirChange pankuzu");
                pankuzu.innerHTML = "";
                for(const content of pankuzuItems) {
                    pankuzu.appendChild(content);
                }

                debug("CurrentDirChange listFiles");
                await listFiles(0);

            } catch(err) {
                console.error(err.stack);
            }
            debug("End of onCurrentDirChange");
        },
    });

    const pageSize = 10;
    let currentPage = 0;

    const pankuzu = createElement("SPAN");
    const btnPagePrev = createButton("Prev", () => {
        debug("*** btnPagePrev ***");
        readPrevPage();
    });
    const btnPageNext = createButton("Next", () => {
        debug("*** btnPageNext ***");
        readNextPage();
    });
    const list = createElement("OL");

    const readPrevPage = async () => {
        debug(`readPrevPage ${currentPage - 1}`);
        await listFiles(currentPage - 1);
    };
    const readNextPage = async () => {
        debug(`readNextPage ${currentPage + 1}`);
        await listFiles(currentPage + 1);
    };
    const updateButtons = () => {
        disableButton(btnPagePrev, currentPage === 0);
        disableButton(btnPageNext,
            (currentPage + 1) * pageSize >= gdfsUi._files.length &&
                gdfsUi.isPageCompleted());
    };

    const listFiles = async page => {
        page = page || 0;
        currentPage = page;

        const listItems = [];

        // Add a link to parent directory
        const path = gdfsUi.getCurrentPath();
        if(path.length > 1) {
            listItems.push(createElement("LI", {}, createElement("A",
                { href: "javascript:void(0);" }, "../", {
                    click: async () => {
                        debug("*** cd to the parent dir ***");
                        await gdfsUi.chdirById("..");
                    }
                }
            )));
        }

        const begin = currentPage * pageSize;
        const files = await gdfsUi.getFiles(begin, begin + pageSize);
        debug(`listFiles: ${files.length} files`);
        for(const file of files) {
            const contents = [];
            if(file.webViewLink) {
                contents.push(createElement("A",
                    { target: "_blank", href: file.webViewLink },
                    "[webViewLink]"));
            }

            if(!Gdfs.isFolder(file) && file.webContentLink) {
                contents.push(createElement("A",
                    { href: file.webContentLink },
                    "[webContentLink]"));

                // Download button
                contents.push(createButton("<u>Download By Code</u>",
                    async () => {
                        debug("*** Download by code ***");
                        try {
                            const result = await Gdfs.downloadFile(file.id);
                            debug(result);
                        } catch(err) {
                            debug(err.message);
                        }
                    }));
            }

            if(Gdfs.isFolder(file)) {
                contents.push(createElement("A",
                    { href:"javascript:void(0);", }, `${file.name}/`,
                    {
                        "click": async () => {
                            debug(`*** cd to ${file.name}#${file.id} ***`);
                            await gdfsUi.chdirById(file.id);
                        }
                    }));
            } else {
                contents.push(createElement("A",
                    { href:"javascript:void(0);", }, file.name,
                    {
                        "click": () => {
                            debug(`*** get a resource of ${file.name}#${file.id} ***`);
                            gdfsUi.getFileResource(file.id);
                        }
                    }));
            }
            insertBetweenEachItem(contents, () => text(" "));
            listItems.push(createElement("LI", {}, contents));
        }

        // Clear file list
        list.innerHTML = "";
        for(const li of listItems) {
            list.appendChild(li);
        }
        updateButtons();
    };

    element.innerHTML = "";
    element.appendChild(text("CWD: "));
    element.appendChild(pankuzu);
    element.appendChild(text(" Page: "));
    element.appendChild(btnPagePrev);
    element.appendChild(btnPageNext);
    element.appendChild(list);

    // Allow to drop files to store to the current directory.
    element.addEventListener("dragover", event => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    });
    element.addEventListener("drop", async event => {
        event.stopPropagation();
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const result = await Promise.all(files.map( file => {
            return gdfsUi.uploadFile(file);
        }));
        debug(JSON.stringify(result));
        currentPage = 0;
        await gdfsUi.reload();
    });

    const commandPanel = createElement("DIV", {"class": "commandPanel"});
    element.appendChild(commandPanel);
    createCommandPanel(commandPanel, gdfsUi);

    debug("End of createFileList");
    return gdfsUi;
};

const insertBetweenEachItem = (array, createValue) => {
    for(let i = array.length - 1; i > 0; i--) {
        array.splice(i,0, createValue(i, array) );
    }
};

const createCommandPanel = (root, gdfsUi) => {
    createExecuter(root, "Gdfs#chdir",
        [{name:"path","type":"string"}],
        async path => {
            return await gdfsUi._gdfs.chdir(path);
        }
    );
    createExecuter(root, "Gdfs#cwd", [], () => gdfsUi._gdfs.cwd());
    createExecuter(root, "Gdfs#getCurrentFolderId", [],
        () => gdfsUi._gdfs.getCurrentFolderId());
    createExecuter(root, "Gdfs#getCurrentPath", [],
        () => JSON.stringify(gdfsUi._gdfs.getCurrentPath()));
    createExecuter(root, "Gdfs#isDirectory",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await gdfsUi._gdfs.isDirectory(new Gdfs.Path(path))));
    createExecuter(root, "Gdfs#readFile",
        [{name:"path","type":"string"}],
        async path => await gdfsUi._gdfs.readFile(path));
    createExecuter(root, "Gdfs#mkdir",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await gdfsUi._gdfs.mkdir(path), null, "  "));
    createExecuter(root, "Gdfs#rmdir",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await gdfsUi._gdfs.rmdir(path), null, "  "));
    createExecuter(root, "Gdfs#unlink",
        [{name:"path","type":"string"}],
        async path => JSON.stringify(
            await gdfsUi._gdfs.unlink(path), null, "  "));
    createExecuter(root, "Gdfs#writeFile", [
        {name:"path","type":"string"},
        {name:"mimeType","type":"string"},
        {name:"data","type":"string"},
    ], async (path, mimeType, data) =>
        await gdfsUi._gdfs.writeFile(path, mimeType, data));
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
            const files = await gdfsUi._gdfs.readdir(path, options);
            const outopts = options || {};
            return {
                result: files,
                pageToken: outopts.pageToken || null,
            };
        }
    );
    createExecuter(root, "Gdfs#stat",
        [{name:"path","type":"string"}],
        async path => await gdfsUi._gdfs.stat(path));
    return root;
};

const toName = name => name.replace(/[\s.#[\]<>]/g, "-");

const createExecuter = (root, name, params, execHandler) => {
    const className = name.replace(/[\s.#[\]<>]/g, "-");
    const paramsHTML = params.map(param => `
        <div class="param">
            <div class="name">${param.name}</div>
            <div class="input">${createInputHTML(param)}</div>
        </div>`
    ).join("");

    root.insertAdjacentHTML("beforeEnd", `
        <div class="command ${className}">
            <div class="name">${name}</div>
            <div class="params">${paramsHTML}</div>
            <div class="button"><button type="button">Execute</button></div>
            <div class="result"><pre class="result"></pre></div>
        </div>`);

    const baseSelector = `.command.${className}`;
    const btnExec = root.querySelector(`${baseSelector} button`);
    const txtResult = root.querySelector(`${baseSelector} pre.result`);

    btnExec.addEventListener("click", async () => {
        const args = params.map(param => {
            switch(param.type) {
            case "string": {
                const inputString = root.querySelector(
                    `${baseSelector} input.${toName(param.name)}`);
                return inputString.value;
            }
            case "integer": {
                const inputString = root.querySelector(
                    `${baseSelector} input.${toName(param.name)}`);
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
    const name = toName(param.name);
    switch(param.type) {
    case "string":
        return `<input name="${name}" class="param ${name}" type="text"/>`;
    default:
        break;
    }
    return `<input name="${name}" class="param ${name}" type="text"/>`;
};

const createButton = (caption, clickHandler) => {
    return createElement(
        "BUTTON", {type: "button"}, caption,
        { "click": clickHandler });
};

const disableButton = (button, disabled) => {
    if(disabled) {
        button.setAttribute("disabled", "disabled");
    } else {
        button.removeAttribute("disabled");
    }
};

const text = text => document.createTextNode(text);

const createElement = (tagName, attributes, contents, eventHandlers) => {
    attributes = attributes || {};
    contents = contents || [];
    eventHandlers = eventHandlers || {};

    const e = document.createElement(tagName);

    for(const name of Object.keys(attributes)) {
        e.setAttribute(name, attributes[name]);
    }
    if(typeof(contents) === "string") {
        e.innerHTML = contents;
    } else {
        if(!Array.isArray(contents)) {
            contents = [ contents ];
        }
        for(const content of contents) {
            if(typeof(content) === "string") {
                e.appendChild(text(content));
            } else {
                e.appendChild(content);
            }
        }
    }
    for(const eventName of Object.keys(eventHandlers)) {
        e.addEventListener(eventName, eventHandlers[eventName]);
    }
    return e;
};

main();
