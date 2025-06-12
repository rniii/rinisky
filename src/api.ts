/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { PluginSettings } from "settings";

/**
 * Puts a function's result behind a lazy proxy.
 *
 * Can be recursively destructured:
 *
 * ```js
 * const { foo } = lazy(() => console.log('this will not run, yet'))
 * ```
 */
export const lazy = <T extends object>(get: () => T) => {
  let cached: any;
  let sameTick = true;
  setTimeout(() => sameTick = false);

  return new Proxy<T>(function() {} as any, {
    get: (_, key) =>
      sameTick
        ? lazy(() => (cached ??= get())[key])
        : Reflect.get(cached ??= get(), key),
    set: (_, key, val) => Reflect.set(cached ??= get(), key, val),
    apply: (_, that, args) => Reflect.apply(cached ??= get(), that, args),
    construct: (_, args) => Reflect.construct(cached ??= get(), args),
  });
};

/**
 * Makes regex for source code easier to read. Special characters (`.*+?^${([])}|`) are used with
 * escapes instead (i.e. `\.\*`)
 *
 * \i is an alias for a regex that matches any JavaScript identifier
 */
export const re = (template: TemplateStringsArray) => {
  const raw = template.raw[0];
  const flags = raw.match(/^\(\?([a-z]+)\)/);
  const regex = new RegExp(
    raw
      .slice(flags?.[0].length)
      .replace(/\\*[.*+?^${([\])}|]/g, (m) => m.length % 2 ? "\\" + m : m.slice(1))
      .replace(/\\i/g, "[A-Za-z_$][\\w$]*"),
    flags?.[1],
  );
  regex.toString = () => "re`" + raw + "`";
  return regex;
};

export interface ReplacementDef {
  match: string | RegExp;
  replace: string | ((substring: string, ...args: any[]) => string);
}

export interface PatchDef {
  query?: string | string[];
  patch: ReplacementDef | ReplacementDef[];
}

export interface PluginDef {
  name: string;
  patches?: PatchDef[];
  start?(): void;
  settings?: PluginSettings<any>;
}

export interface Patch extends PatchDef {
  query?: string[];
  patch: ReplacementDef[];
  applied?: boolean;
}

export interface Plugin extends PluginDef {
  required?: boolean;
  id: number;
  patches: Patch[];
}

export const plugins = [] as Plugin[];

export const definePlugin = <T extends PluginDef>(plugin: T & Record<string, any>) => {
  // @ts-ignore
  plugin.id = plugins.length;
  plugin.patches ??= [];

  for (const patch of plugin.patches) {
    if (patch.query && !Array.isArray(patch.query)) patch.query = [patch.query];
    if (!Array.isArray(patch.patch)) patch.patch = [patch.patch];

    for (const p of patch.patch) {
      if (typeof p.replace == "string") {
        p.replace = p.replace.replace("$self", `rsky.plugins[${plugin.id}]`);
      } else {
        const f = p.replace;
        // @ts-ignore
        p.replace = (...args: any[]) => f(...args).replace("$self", `rsky.plugins[${plugin.id}]`);
      }
    }
  }

  plugins.push(plugin as any);

  return plugin as any as Plugin;
};

export const bskyManifest = {
  version: "",
  name: "",
  slug: "",
};
