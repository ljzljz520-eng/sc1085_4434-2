import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await cp("index.html", "dist/index.html");
await build({
  entryPoints: ["src/app.js"],
  outfile: "dist/assets/app.js",
  bundle: true,
  minify: true,
  target: "es2022"
});
await build({
  entryPoints: ["src/styles.css"],
  outfile: "dist/assets/styles.css",
  bundle: true,
  minify: true,
  target: "es2022"
});
