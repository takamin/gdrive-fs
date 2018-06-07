const assert = require("chai").assert;
const GdfsPath = require("../lib/gdfs-path.js");
describe("class GdfsPath", () => {
    describe("default constructor", () => {
        it("should be initialized as a root directory", () => {
            const path = new GdfsPath();
            assert.isTrue(path.isAbsolute());
            assert.isTrue(path.isDirSpec());
            assert.equal("/", path.toString());
        });
    });
    describe("constructor with initializing", () => {
        it("should be initialized with a relative path", () => {
            const path = new GdfsPath("foo");
            assert.equal("foo", path.toString());
        });
        it("should be initialized with an absolute path", () => {
            const path = new GdfsPath("/foo");
            assert.equal("/foo", path.toString());
        });
        it("should be initialized with redundant slashes", () => {
            const path = new GdfsPath("//foo//bar//");
            assert.equal("/foo/bar/", path.toString());
        });
        it("should remove a current directory specifier", () => {
            const path = new GdfsPath("foo/./bar");
            assert.equal("foo/bar", path.toString());
        });
        it("should remain a current directory specifier at head", () => {
            const path = new GdfsPath("./foo");
            assert.equal("./foo", path.toString());
        });
        it("should rewind with a parent directory specifier", () => {
            const path = new GdfsPath("foo/../bar");
            assert.equal("bar", path.toString());
        });
        it("should not rewind a parent directory specifier at head", () => {
            const path = new GdfsPath("../bar");
            assert.equal("../bar", path.toString());
        });
    });
    describe("#isAbsolute", () => {
        it("should be true if the path starts with a slash", () => {
            const path = new GdfsPath("/foo");
            assert.isTrue(path.isAbsolute());
        });
        it("should be false if the path does not starts with a slash", () => {
            const path = new GdfsPath("foo");
            assert.isFalse(path.isAbsolute());
        });
    });
    describe("#isDirSpec", () => {
        it("should be true if the path ends with a slash", () => {
            const path = new GdfsPath("/foo/");
            assert.isTrue(path.isDirSpec());
        });
        it("should be false if the path does not ends with a slash", () => {
            const path = new GdfsPath("/foo");
            assert.isFalse(path.isDirSpec());
        });
    });
    describe("#toString", () => {
        it("should returns a path", () => {
            const path = new GdfsPath("foo");
            assert.equal("foo", path.toString());
        });
        it("should returns an absolute path", () => {
            const path = new GdfsPath("/foo");
            assert.equal("/foo", path.toString());
        });
        it("should returns an absolute path with not double slashed", () => {
            const path = new GdfsPath("//foo");
            assert.equal("/foo", path.toString());
        });
        it("should returns an path that using double slash", () => {
            const path = new GdfsPath("//foo//bar//");
            assert.equal("/foo/bar/", path.toString());
        });
    });
    describe("merge", () => {
        it("should not merge an absolute path but override", () => {
            const path = GdfsPath.merge(
                new GdfsPath("/foo/"),
                new GdfsPath("/bar"));
            assert.equal("/bar", path.toString());
        });
        describe("joining a relative path", () => {
            it("should merge", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("bar"));
                assert.equal("/foo/bar", path.toString());
            });
            it("should merge a path that starts with current directory specifier", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("./bar"));
                assert.equal("/foo/bar", path.toString());
            });
            it("should merge a path that starts with parent directory specifier", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("../bar"));
                assert.equal("/bar", path.toString());
            });
            it("should merge a path to a path including a dot for name", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo.foo/"),
                    new GdfsPath("../bar"));
                assert.equal("/bar", path.toString());
            });
            it("should merge a path that starts with multiple parent directory specifier", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/foo/"),
                    new GdfsPath("../../bar"));
                assert.equal("/bar", path.toString());
            });
        });
        describe("Accepts parameters with arguments", () => {
            it("should not merge an absolute path but override", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("/bar/"),
                    new GdfsPath("baz"));
                assert.equal("/bar/baz", path.toString());
            });
            it("should merge", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("bar/"),
                    new GdfsPath("baz"));
                assert.equal("/foo/bar/baz", path.toString());
            });
            it("should merge a path that starts with current directory specifier", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("./"),
                    new GdfsPath("./bar"));
                assert.equal("/foo/bar", path.toString());
            });
            it("should merge a path that starts with parent directory specifier", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"),
                    new GdfsPath("foo/"),
                    new GdfsPath("../../bar"));
                assert.equal("/bar", path.toString());
            });
        });
        describe("Accepts string parameters", () => {
            it("should accept string parameters at head and tail", () => {
                const path = GdfsPath.merge(
                    "/foo/", new GdfsPath("/bar/"), "baz");
                assert.equal("/bar/baz", path.toString());
            });
            it("should accept string parameters at intermediate", () => {
                const path = GdfsPath.merge(
                    new GdfsPath("/foo/"), "/bar/", new GdfsPath("baz"));
                assert.equal("/bar/baz", path.toString());
            });
        });
    });
    describe("#elements", () => {
        describe("an absolute path", () => {
            describe("not pointing to folder", () => {
                it("should start with empty element", () => {
                    const elements = (new GdfsPath("/abc/def")).elements();
                    assert.deepEqual(["", "abc", "def"], elements);
                });
            });
            describe("pointing to folder", () => {
                it("should start with empty element of an absolute path", () => {
                    const elements = (new GdfsPath("/abc/def/")).elements();
                    assert.deepEqual(["", "abc", "def", ""], elements);
                });
            });
        });
        describe("a relative path", () => {
            describe("not pointing to folder", () => {
                it("should start with empty element", () => {
                    const elements = (new GdfsPath("abc/def")).elements();
                    assert.deepEqual(["abc", "def"], elements);
                });
            });
            describe("pointing to folder", () => {
                it("should start with empty element of an absolute path", () => {
                    const elements = (new GdfsPath("abc/def/")).elements();
                    assert.deepEqual(["abc", "def", ""], elements);
                });
            });
        });
    });
    describe("#getPathPart", () => {
        it("should returns path part when it points a folder", () => {
            const path = new GdfsPath("abc/def/");
            assert.deepEqual(new GdfsPath("abc/def/"), path.getPathPart());
        });
        it("should returns path part when it points a file", () => {
            const path = new GdfsPath("abc/def");
            assert.deepEqual(new GdfsPath("abc/"), path.getPathPart());
        });
    });
    describe("#getFilename", () => {
        it("should returns empty it points a folder", () => {
            const path = new GdfsPath("abc/def/");
            assert.deepEqual("", path.getFilename());
        });
        it("should returns the filename when it points a file", () => {
            const path = new GdfsPath("abc/def");
            assert.deepEqual("def", path.getFilename());
        });
    });
});
