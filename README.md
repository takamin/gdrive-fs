gdrive-fs
=========

Google Drive API client for Web Application.

__CAUTION:__
After v2.0.0, The API loadApi is changed. It needs clientSecret at its second
parameter instead of apiKey.
It is needed to clear the cookies of the web pages running by command `npm start` or
`npm run web-test`. On the pages, the API key has been saved to cookies to connect
Google drive APIs.

A brief explanation is described in a documet for the class
[Gdfs](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs.html).

APIs
----

* Class [Gdfs](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs.html) as a client of the Google Drive file system.
    * Class methods
        * async [`loadApi(clientId, clientSecret)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.loadApi) loads Google Drive APIs(v3) and initializes its client.
        * [`isSignedIn()`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.isSignedIn) tests the client is signed-in to the Google Drive.
        * async [`signIn()`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.signIn) signs-in with a Google Account.
        * async [`signOut()`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#.signOut) signs-out.
    * Instance methods
        * async [`chdir(directory)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#chdir) changes the current working directory.
        * [`cwd()`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#cwd) - returns the current working directory.
        * async [`isDirectory(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#isDirectory) tests the path is a directory.
        * async [`mkdir(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#mkdir) creates a folder.
        * async [`readdir(path, options)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#readdir) lists file names.
        * async [`readFile(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#readFile) read the file contents.
        * async [`rmdir(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#rmdir) removes the directory.
        * async [`stat(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#stat) returns properties of Google Drive files.
        * async [`unlink(path)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#unlink) removes the file (without moving to the trash-box).
        * async [`writeFile(path, mimeType, data)`](https://takamin.github.io/gdrive-fs/jsdoc/Gdfs#writeFile) writes data to the file.
* Class [Gdfs.Path](https://takamin.github.io/gdrive-fs/jsdoc/GdfsPath.html) - as representation of path for the Google Drive files.
* Class [Gdfs.Ui](https://takamin.github.io/gdrive-fs/jsdoc/GdfsUi.html)(alpha) - A class supporting to create UI.

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
