/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, useReducer } from "react";

const plainSettings = Object.create(null) as {
  plugins: Record<string, { enabled: boolean } & any>;
};

plainSettings.plugins = {};

const loadSettings = () => {
  Object.assign(plainSettings, JSON.parse(localStorage.getItem("rsky.settings")!));
};

let settingsTimeout: ReturnType<typeof setTimeout>;
const saveSettings = () => {
  clearTimeout(settingsTimeout);

  settingsTimeout = setTimeout(() => {
    localStorage.setItem("rsky.settings", JSON.stringify(plainSettings));
  }, 300);
};

try {
  loadSettings();
  addEventListener("storage", loadSettings);
} catch { /* noop */ }

const proxy = <T>(obj: T, callback: () => void) =>
  obj && typeof obj == "object"
    ? new Proxy(obj as any, {
      get: (o, p) => proxy(o[p], callback),
      set: (o, p, v) => (o[p] = v, callback(), true),
    }) as T
    : obj;

const withDefault = <T>(obj: T, get: (key: string) => any) =>
  new Proxy(obj as any, {
    get: (o, p) => p in o ? o[p] : get(p as any),
  }) as T;

const settings = proxy(plainSettings, saveSettings);

export default settings;

type SettingDef =
  | { type: "number"; default?: number }
  | { type: "string"; default?: string }
  | { type: "any"; default?: any };

type SettingType<D extends SettingDef> = D["type"] extends "number" ? number
  : D["type"] extends "string" ? string
  : D["type"] extends "any" ? D extends { default: infer T } ? T : any
  : never;

export interface PluginSettings<T> {
  store: T;
  use(): T;
}

export const defineSettings = <D extends Record<string, SettingDef>>(def: D): PluginSettings<
  { [K in keyof D]: SettingType<D[K]> }
> => {
  const obj = {
    _plugin: "",
    _proxy: null as any,
    _forceUpdate: null as (() => void) | null,

    def,

    get store() {
      if (!this._plugin) throw Error("plugin settings is uninitialized");

      return this._proxy ??= withDefault(
        proxy(settings.plugins[this._plugin], () => this._forceUpdate?.()),
        key => def[key].default,
      );
    },

    use() {
      const [, subscribe] = useReducer(() => {}, null);
      useEffect(() => {
        this._forceUpdate = subscribe;
      }, []);

      return this.store;
    },
  };

  return obj;
};
