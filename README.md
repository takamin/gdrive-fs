gdrive-fs
=========

Google Drive API client for Web App.

To connect your google drive files from your Web App,
you must create a clientId and an apiKey in the project of the Google Developer Console.

```javascript
const Gdfs = require("gdrive-fs");
const connectGdfs = async() => {
    Gdfs.signInStatusChangeEvent.listen(() => runGdfs());
    await Gdfs.loadApi(<clientId>, <apiKey>);
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

INSTALL
-------

To install, use npm for your project.

```bash
$ npm install --save gdrive-fs
```

USING WITH BUNDLER
------------------

If you are using some bundler, you can just import this module and use.

```javascript
const Gdfs = require("gdrive-fs");
Gdfs.loadApi(
.
.
.
```

USING WITHOUT BUNDLER
--------------------

If you do not use any bundler, the following built files are available to include by SCRIPT tag.

* `node_module/gdrive-fs/build/grive-fs.min.js`
* `node_module/gdrive-fs/build/grive-fs.js`

```xml
<!DOCTYPE html>
<html>
<head>
...
<script src="<path-to-gdrive-fs>/build/gdrive-fs.min.js"></script>
</body>
```

BUILD DISTRIBUTIONS
------------------

```bash
$ npm run release
```

LICENSE
-------

This module published under [MIT LICENSE](LICENSE.md).
