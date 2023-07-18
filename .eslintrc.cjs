module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["standard-with-typescript","prettier"],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}",
                "*.md"
            ],
            "parserOptions": {
                "sourceType": "script"
            },
            "parser": "eslint-plugin-markdownlint/parser",
            "extends": ["plugin:markdownlint/recommended"]
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "rules": {
    }
}
