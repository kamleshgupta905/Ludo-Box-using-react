import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = ".output/public";
const assets = await readdir(join(publicDir, "assets"));
const clientEntry = assets.find((file) => /^index-.*\.js$/.test(file));

if (!clientEntry) {
  throw new Error("Could not find the production client entry bundle.");
}

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0B0F1A" />
    <title>Ludo Feel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${clientEntry}"></script>
  </body>
</html>`;

await writeFile(join(publicDir, "index.html"), html);
