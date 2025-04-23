/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from "react";

import { bskyManifest, definePlugin, re } from "api";
import { InlineLinkText, Text, useTheme } from "plugins/ui";
import { withErrorBoundary } from "utils";

const COMMIT_URL = (hash: string) => "https://github.com/rniii/rinisky/commit/" + hash;

export default definePlugin({
  required: true,

  name: "Core",
  patches: [
    {
      patch: {
        match: re`to:"/profile/sawaratsuki.bsky.social"\.\{0,512\}\?children:[\i,\i,\i,\i,\.\*\?\(\?=]\)`,
        replace: "$&,$self.renderVersion()",
      },
    },
  ],

  renderVersion: withErrorBoundary(() => {
    const t = useTheme();

    return (
      <>
        <Text style={[t.atoms.text_contrast_medium, { lineHeight: 1.3 }]}>
          {bskyManifest.slug || "Bluesky"} {bskyManifest.version || ""}
          <br />
          rinisky{" "}
          <InlineLinkText to={COMMIT_URL(RSKY_COMMIT)}>
            {RSKY_VERSION}
          </InlineLinkText>
        </Text>
      </>
    );
  }),
});
