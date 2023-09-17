"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const path = require("path");

function resolveFullPaths({ orig, file, config }) {
  return orig.replace(/['"]([^"'\r\n]+)['"]/, (match, importPath) => {
    if (!importPath.startsWith(".")) return match;
    const { dir, name } = path.parse(importPath);
    const ext = /\.mjs$/.test(file) ? ".mjs" : ".js";
    return JSON.stringify(`${dir}/${name}${ext}`);
  });
}
exports.default = resolveFullPaths;
