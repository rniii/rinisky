/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// @ts-check
import { execSync } from "child_process";
import { build, context } from "esbuild";
import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { createContext, runInContext } from "vm";

const watch = process.argv.includes("--watch") || process.argv.includes("-w");
const lint = process.argv.includes("--lint");

const fullHash = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const version = `${process.env.npm_package_version}+git.${gitHash}`;

const banner = `\
// ==UserScript==
// @name        rinisky
// @match       https://bsky.app/*
// @match       https://*.bsky.dev/*
// @match       https://deer.social/*
// @run-at      document-start
// ==/UserScript==`;

const options = /** @type {import("esbuild").BuildOptions} */ ({
  globalName: "rsky",
  entryPoints: ["src/patch.ts"],
  outfile: "dist/rsky.user.js",
  external: [
    "@atproto/api",
    "react",
    "react-native",
  ],
  bundle: true,
  minifySyntax: true,
  define: {
    RSKY_COMMIT: JSON.stringify(fullHash),
    RSKY_VERSION: JSON.stringify(version),
    window: "unsafeWindow",
  },
  banner: { js: banner },
  footer: { js: "window.rsky = rsky" },
  sourcemap: "linked",
  jsxImportSource: "react",
  jsx: "automatic",

  plugins: [
    {
      name: "import-plugins",
      setup(build) {
        const filter = /^~plugins/;
        const namespace = "import-plugins";

        build.onResolve({ filter }, ({ path }) => ({ namespace, path }));

        build.onLoad({ filter, namespace }, async () => {
          let contents = "";

          for (const dir of ["plugins", "userplugins"]) {
            const files = await readdir(path.join("src", dir)).catch(() => []);

            for (const file of files) contents += `import ${JSON.stringify(path.join(dir, file))};\n`;
          }

          return { contents, resolveDir: "./src" };
        });
      },
    },
    {
      name: "lint-patches",
      async setup(build) {
        if (!lint) return;

        // *var m = { ... }, c = {};* function require(id) {...}
        const WEBPACK_RE =
          /var \w=\{\d+:.*?\},\w=\{\};(?=function \w\(\w\)\{var \w=\w\[\w\];if\(void 0!==\w\)return \w\.exports;)/;

        if (!existsSync("dist/bsky")) await import("./fetchSources");

        const main = await readFile("dist/bsky/main.js", "utf8");
        const [chunk, id] = main.match(WEBPACK_RE) ?? ['throw "fish";'];

        build.onEnd(async () => {
          const nop = () => {};
          const ctx = createContext(
            /** @type {typeof window} */ ({
              console: { log: nop, debug: nop, trace: nop, warn: console.warn },
              setTimeout,
            }),
          );

          runInContext("window = unsafeWindow = globalThis", ctx);
          runInContext(await readFile("dist/rsky.user.js", "utf8"), ctx);

          runInContext(chunk, ctx);
          runInContext(`(() => {}).m = ${id}`, ctx);

          for (const plugin of ctx.rsky.plugins) {
            for (const patch of plugin.patches) {
              if (!patch.applied) {
                console.warn(`${plugin.name}: patch failed: `, patch.patch);
              }
            }
          }
        });
      },
    },
  ],
});

if (watch) {
  await context(options).then(ctx => ctx.watch());
} else {
  await build(options);
}
