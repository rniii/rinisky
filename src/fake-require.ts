/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const _export = (id: string, mod: any) => require.cache[id] = mod;

const require = (mod: string) => require.cache[mod];

require.cache = {} as Record<string, any>;
// @ts-ignore
window.require = require;
