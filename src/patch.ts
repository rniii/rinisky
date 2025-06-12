/*!
 * rinisky, a client modification for the bluesky app
 * Copyright (c) 2025 rini and contributors
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import "fake-require";
import "webpack/atproto-api";
import "webpack/react";
import "webpack/react-native";
import "webpack/react-runtime";

import "~plugins";

import { bskyManifest, plugins } from "api";
import { countWarning } from "plugins/core";
import settings from "settings";
import { _registerWreq } from "webpack";

export { plugins, settings };
export * as api from "api";
export * as webpack from "webpack";

const isBrowser = "navigator" in window;

const log = (msg: string, ...args: any[]) =>
  console.log("%crsky |%c " + msg, "color:#0db", "color:currentColor", ...args);

const warn: typeof console.warn = (...args) => {
  countWarning();
  console.warn(...args);
};

log(`loading v${RSKY_VERSION}`);

if (isBrowser && new URLSearchParams(window.location.search).get("vanilla")) {
  throw "nevermind";
}

// yay prototype pollution
Object.defineProperty(Function.prototype, "m", {
  configurable: true,
  set(value) {
    console.trace("read if cute");

    // @ts-expect-error
    delete Function.prototype.m;
    this.m = value;

    // ty vee
    // https://github.com/Vendicated/WebpackGrabber/blob/main/WebpackGrabber.user.js#L15-L33
    const cacheYoink = Symbol();
    let cache: any;

    Object.defineProperty(Object.prototype, cacheYoink, {
      configurable: true,
      get() {
        cache = this;
        return { exports: {} };
      },
      set() {},
    });

    this(cacheYoink);

    // @ts-expect-error
    delete Object.prototype[cacheYoink];
    cache && delete cache[cacheYoink];

    this.c = cache; // *exports your internal*

    _registerWreq(this);
    patchFactories(value);
    startPlugins();
  },
});

const enabledPlugins = plugins.filter(p => p.required || settings.plugins[p.name]?.enabled || !isBrowser);

const patchFactories = (factories: any) => {
  for (const m in factories) {
    let code = Function.prototype.toString.call(factories[m]);
    const patchedBy = new Set<string>();

    const isMain = code.includes('.get("kawaii")');

    if (isMain) {
      log(`found main module: ${m}`);

      const [, version, name, slug] = code.match(/APP_MANIFEST:\{version:"(.*?)",name:"(.*?)",slug:"(.*?)"/) ?? [];

      Object.assign(bskyManifest, { version, name, slug });
    }

    for (const plugin of enabledPlugins) {
      for (const patch of plugin.patches) {
        if (isMain ? patch.query : !patch.query || patch.query.every(m => code.includes(m))) continue;

        if (patch.applied) {
          warn(`${plugin.name}: query is not unique: ${patch.query}`);
        }
        patch.applied = true;
        patchedBy.add(plugin.name);

        for (const repl of patch.patch) {
          const oldCode = code;
          code = code.replace(repl.match, repl.replace as any);
          if (code === oldCode) {
            warn(`${plugin.name}: patch failed: ${repl.match}`);
          }
        }
      }
    }

    if (!patchedBy.size) continue;

    try {
      factories[m] = (0, eval)(
        `// Patched by ${[...patchedBy].join(", ")}\n`
          + `0,${code}\n`
          + `//# sourceURL=webpack://Webpack${m}`,
      );

      log(`patched ${m}: ${[...patchedBy].join(", ")}`);
    } catch (e) {
      warn(e, { code });
    }
  }

  for (const plugin of enabledPlugins) {
    for (const patch of plugin.patches) {
      if (!patch.applied) {
        warn(`${plugin.name}: query failed: `, patch.query);
      }
    }
  }
};

const startPlugins = () => {
  for (const plugin of enabledPlugins) {
    plugin.start?.();
  }
};
