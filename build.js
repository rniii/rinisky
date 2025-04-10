import { execSync } from "child_process";
import { build } from "esbuild";
import { context } from "esbuild";
import { appendFile, readFile, unlink } from "fs/promises";

const watch = process.argv.includes("--watch") || process.argv.includes("-w");

const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const version = `${process.env.npm_package_version}+git.${gitHash}`;

const banner = `\
// ==UserScript==
// @name        rinisky
// @match       https://bsky.app/*
// @run-at      document-start
// ==/UserScript==`;

const options = /** @type {import("esbuild").BuildOptions} */ ({
  globalName: "rsky",
  entryPoints: ["src/patch.ts"],
  outfile: "dist/rsky.user.js",
  bundle: true,
  minifySyntax: true,
  minifyIdentifiers: false,
  define: {
    VERSION: JSON.stringify(version),
    window: "unsafeWindow",
  },
  banner: { js: banner },
  footer: { js: ";window.rsky=rsky" },
  jsx: "transform",
  jsxFactory: "createElement",
  jsxFragment: "Fragment",
  inject: ["src/webpack/react.ts"],
});

if (watch) {
  await context(options).then(ctx => ctx.watch());
} else {
  await build(options);
}
