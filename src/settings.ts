/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const settings = Object.create(null) as {
  plugins: Record<string, {
    enabled: boolean;
  }>;
};

settings.plugins = {};

const loadSettings = () => {
  Object.assign(settings, JSON.parse(localStorage.getItem("rsky.settings")!));
};

const saveSettings = () => {
  localStorage.setItem("rsky.settings", JSON.stringify(settings));
};

try {
  loadSettings();
  addEventListener("storage", loadSettings);
} catch { /* noop */ }

const proxy = <T>(obj: T) =>
  obj && typeof obj == "object"
    ? new Proxy(obj as any, {
      get: (o, p) => proxy(o[p]),
      set: (o, p, v) => (o[p] = v, saveSettings(), true),
    }) as T
    : obj;

export default proxy(settings);
