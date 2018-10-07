gdrive-fs
=========

Google Drive API client for Web Application.

A brief explanation is described in a documet for the class
[Gdfs](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs.html).

APIs
----

* Class [Gdfs](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs.html) as a client of the Google Drive file system.
    * Class methods
        * [loadApi()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.loadApi).
        * [isSignedIn()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.isSignedIn).
        * [signIn()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.signIn).
        * [signOut()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.signOut).
    * Instance methods
        * [chdir()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#chdir).
        * [cwd()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#cwd).
        * [isDirectory()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#isDirectory).
        * [mkdir()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#mkdir).
        * [readdir()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#readdir).
        * [readFile()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#readFile).
        * [rmdir()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#rmdir).
        * [stat()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#stat).
        * [unlink()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#unlink).
        * [writeFile()](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#writeFile).
* Class [Gdfs.Path](https://takamin.github.io/gdrive-fs/jsdoc/GdfsPath.html) - as representation of path for the Google Drive files.
* Class [Gdfs.Ui](https://takamin.github.io/gdrive-fs/jsdoc/GdfsUi.html)(alpha) - A class supporting to create UI.

A file listing sample for Gdfs.UI is here:

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
