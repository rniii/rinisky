import type { PatchDef, PluginDef, ReplacementDef } from "api";
import { pluginDefs } from "plugins";
import { _registerWreq } from "webpack";

export * as api from "api";
export * as webpack from "webpack";

declare const VERSION: string;
const consoleStyle = ["color:lightgreen", "color:currentColor"];

console.log(`%crsky |%c loading v${VERSION}`, ...consoleStyle);

interface Patch extends PatchDef {
  query: string[];
  patch: ReplacementDef[];
  applied?: boolean;
}

interface Plugin extends PluginDef {
  patches: Patch[];
}

export const plugins = [] as Plugin[];

// initialize plugins
for (const [i, plugin] of pluginDefs.entries()) {
  plugin.patches ??= [];

  for (const patch of plugin.patches) {
    if (!Array.isArray(patch.query)) patch.query = [patch.query];
    if (!Array.isArray(patch.patch)) patch.patch = [patch.patch];

    for (const p of patch.patch) {
      if (typeof p.replace == "string") {
        p.replace = p.replace.replace("$self", `rsky.plugins[${i}]`);
      } else {
        const f = p.replace;
        p.replace = (...args: any[]) => f(...args).replace("$self", `rsky.plugins[${i}]`);
      }
    }
  }

  plugins.push(plugin as Plugin);
}

// yay prototype pollution
Object.defineProperty(Function.prototype, "m", {
  configurable: true,
  set(value) {
    console.log("%crsky |%c got main chunk", ...consoleStyle);
    // @ts-expect-error
    _registerWreq(window.wreq = this), delete Function.prototype.m;

    patchFactories(this.m = value);

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
  },
});

const patchFactories = (factories: any) => {
  for (const m in factories) {
    let code = Function.prototype.toString.call(factories[m]);
    let patchedBy = [] as string[];

    for (const plugin of plugins) {
      for (const patch of plugin.patches) {
        if (!patch.query.every(m => code.includes(m))) continue;

        if (patch.applied) {
          console.warn(`${plugin.name}: query is not unique: ${patch.query}`);
        }
        patch.applied = true;
        patchedBy.push(plugin.name);

        for (const repl of patch.patch) {
          const oldCode = code;
          code = code.replace(repl.match, repl.replace as any);
          if (code === oldCode) {
            console.warn(`${plugin.name}: patch failed: ${repl.match}`);
          }
        }
      }
    }

    if (!patchedBy.length) continue;

    try {
      factories[m] = (0, eval)(
        `// Patched by ${patchedBy.join(", ")}\n`
          + `0,${code}\n`
          + `//# sourceURL=Webpack${m}`,
      );

      console.log(`%crsky |%c patched ${m}: ${patchedBy.join(", ")}`, ...consoleStyle);
    } catch (e) {
      console.warn(e, { code });
    }
  }
};
