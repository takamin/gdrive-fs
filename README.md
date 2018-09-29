gdrive-fs
=========

Google Drive API client for Web App.

To connect your google drive files from your Web App,
you must create a clientId and an apiKey in the project of the Google Developer Console.

You should use a bundler to use this module.

```javascript
const Gdfs = require("gdrive-fs");
const connectGdfs = async() => {
    Gdfs.signInStatusChangeEvent.listen(() => runGdfs());
    await Gdfs.loadApi({
        clientId: "<clientId>",
        apiKey: "<apiKey>",
        discoveryDocs:
            ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
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
    if(Gdfs.isSignedIn()) {
        runGdfs();
    }
};

const runGdfs = async () => {

    const gdfs = new Gdfs();

    await gdfs.chdir(path);
    const cwd = gdfs.cwd();
    await gdfs.mkdir(path);
    const content = await gdfs.readFile(path);
    await gdfs.rmdir(path);
    await gdfs.unlink(path);
    await gdfs.writeFile(path, mimeType, data);
};
connectGdfs();
```

A sample is here:

* [./public/index.html](./public/index.html)
* [./public/index.js](./public/index.js)

LICENSE
-------

This module published under [MIT LICENSE](LICENSE.md).
