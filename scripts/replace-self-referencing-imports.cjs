"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const path = require("path");
const distDir = path.resolve(__dirname, "..", "dist").replace(/\\/g, "/");
const distSrcDir = path.join(distDir, "package").replace(/\\/g, "/");
function replaceSelfReferencingImports({ orig, file, config }) {
  if (!file.replace(/\\/g, "/").startsWith(distDir)) return orig;
  return orig.replace(/['"]([^"'\r\n]+)['"]/, (match, importPath) => {
    if (!importPath.startsWith("@idealeap/gwt")) return match;
    if (!file.replace(/\\/g, "/").startsWith(distSrcDir)) return match;
    let relativePath = path.relative(
      path.dirname(file),
      path.join(distSrcDir, importPath.substring("@idealeap/gwt".length)),
    );
    if (!relativePath.startsWith(".")) relativePath = `./${relativePath}`;
    return JSON.stringify(relativePath);
  });
}
exports.default = replaceSelfReferencingImports;
