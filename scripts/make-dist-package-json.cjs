const pkgJson = require("../package.json");

function processExportMap(m) {
  for (const key in m) {
    const value = m[key];
    if (typeof value === "string") m[key] = value.replace(/^\.\/dist\//, "./");
    else processExportMap(value);
  }
}
processExportMap(pkgJson.exports);

for (const key of ["types", "main", "module"]) {
  if (typeof pkgJson[key] === "string")
    pkgJson[key] = pkgJson[key].replace(/^(\.\/)?dist\//, "./");
}

delete pkgJson.devDependencies;
delete pkgJson.scripts["docs:build"];
delete pkgJson.scripts["docs:dev"];
delete pkgJson.scripts["docs:preview"];
delete pkgJson.scripts.publish;

console.log(JSON.stringify(pkgJson, null, 2));
