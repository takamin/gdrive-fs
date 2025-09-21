const js = require("@eslint/js");

module.exports = [
    {
        ignores: [
            ".cache/*",
            "build/",
            "dist/*",
            "test/*",
            "jsdoc/"
        ]
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                // Node.js globals
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly",
                global: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                setImmediate: "readonly",
                clearImmediate: "readonly",
                // Browser/Web API globals
                window: "readonly",
                document: "readonly",
                Event: "readonly",
                XMLHttpRequest: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                fetch: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                FormData: "readonly",
                Headers: "readonly",
                Request: "readonly",
                Response: "readonly",
                AbortController: "readonly",
                AbortSignal: "readonly",
                Blob: "readonly",
                File: "readonly",
                FileReader: "readonly",
                btoa: "readonly",
                atob: "readonly",
                crypto: "readonly",
                TextEncoder: "readonly",
                TextDecoder: "readonly"
            }
        },
        rules: {
            "indent": ["error", 4],
            "linebreak-style": "off",
            "no-console": "off",
            "quotes": "off",
            "semi": ["error", "always"]
        }
    }
];
