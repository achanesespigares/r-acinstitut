// shinylive-url.mjs · El enlace de Shinylive para una app de R: la app se ejecuta en el navegador (webR),
// sin servidor. El código viaja dentro del propio enlace, comprimido con lz-string, en el formato de
// Shinylive: https://shinylive.io/r/{app|editor}/#code=<JSON de archivos comprimido>.
// Uso: node herramientas/shinylive-url.mjs app.R editor   → escribe el enlace
import { readFileSync } from "node:fs";
import LZString from "lz-string";
const [archivo, modo = "editor"] = process.argv.slice(2);
const archivos = [{ name: "app.R", content: readFileSync(archivo, "utf8"), type: "text" }];
process.stdout.write("https://shinylive.io/r/" + modo + "/#code=" + LZString.compressToEncodedURIComponent(JSON.stringify(archivos)));
