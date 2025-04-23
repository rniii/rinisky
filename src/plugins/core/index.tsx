/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { type ReactNode } from "react";

import { bskyManifest, definePlugin, re } from "api";
import { Text, useTheme } from "plugins/ui";
import { withErrorBoundary } from "utils";

const COMMIT_URL = (hash: string) => "https://github.com/rniii/rinisky/commit/" + hash;
const Link = ({ children, to }: { children?: ReactNode; to: string }) => {
  const [hovered, setHovered] = React.useState(false);
  const style = { textDecoration: hovered ? void 0 : "none" };

  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
};

// nerf statsig
Object.defineProperty(Object.prototype, "setupDiagnostics", {
  configurable: true,
  set() {
    // @ts-expect-error
    delete Object.prototype.setupDiagnostics;
    this.setupDiagnostics = () => {};

    setTimeout(() => Object.keys(this).map(p => this[p] = () => {}));
  },
});

export default definePlugin({
  required: true,

  name: "Core",
  patches: [
    // no sentry
    {
      patch: {
        match: re`(0,\i.init)({enabled:!0,\.\{0,256\}dsn:\.\{0,256\}})`,
        replace: "",
      },
    },
    // no events
    {
      patch: [
        {
          match: re`"https://events.bsky.app`,
          replace: '"about:blank',
        },
        {
          match: re`\i.Statsig.initialize(\i,\.\{0,64\});`,
          replace: ";",
        },
      ],
    },
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
          {bskyManifest.slug || "bluesky"} {bskyManifest.version || ""}
          <br />
          rinisky <Link to={COMMIT_URL(RSKY_COMMIT)}>{RSKY_VERSION}</Link>
        </Text>
      </>
    );
  }),
});
