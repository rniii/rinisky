/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePlugin, re } from "api";
import { defineSettings } from "settings";

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const settings = defineSettings({
  replacements: {
    type: "any",
    default: [] as [match: string, replace: string, regex: boolean][],
  },
});

export default definePlugin({
  name: "TextReplace",
  patches: [
    {
      patch: {
        match: re`\(async function \i(\i,\i){const \i=\)\(\i.text\)\(.replace(/^(\\s*\\n)+/\)`,
        replace: "$1$self.replaceText($2)$3",
      },
    },
  ],
  settings,

  replaceText(text: string) {
    for (const [match, replace, regex] of settings.store.replacements) {
      const pattern = regex ? match : `\\b${escapeRegex(match)}\\b`;

      text = text.replace(new RegExp(pattern, "g"), replace);
    }

    return text;
  },
});
