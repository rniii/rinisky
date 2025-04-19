/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { type CSSProperties, type ReactNode } from "react";

import { bskyManifest, definePlugin, re } from "api";
import { withErrorBoundary } from "utils";

const COMMIT_URL = (hash: string) => "https://github.com/rniii/rinisky/commit/" + hash;

let Alf: any;

let Text = ({ children, style }: { children: ReactNode; style: CSSProperties }): ReactNode => {
  return <div style={style}>{children}</div>;
};

let InlineLinkText = ({ children, to }: { children: ReactNode; to: string }) => {
  return <a href={to} target="_blank">{children}</a>;
};

const useTheme = () => {
  const alf = React.useContext<any>(Alf);

  return React.useMemo(() => alf.theme, [alf]);
};

export default definePlugin({
  name: "Core",
  patches: [
    {
      patch: {
        match: re`to:"/profile/sawaratsuki.bsky.social"\.\{0,512\}\?children:[\i,\i,\i,\i,\.\*\?\(\?=]\)`,
        replace: "$&,$self.renderVersion()",
      },
    },
    {
      patch: {
        match: re`\i=\(\?=\i.createContext({themeName:"light",theme:\i\)`,
        replace: "$&$self.Alf=",
      },
    },
    {
      patch: {
        match: re`function \(\i\)(\i)\.\{0,64\}{children:\i,emoji:\i,style:\i\.\*\?}=`,
        replace: "$self.Text=$1;$&",
      },
    },
    {
      patch: {
        match: re`function \(\i\)(\i)\.\{0,64\}children:\i,to:\i,action:\i,\.\*\?}=`,
        replace: "$self.InlineLinkText=$1;$&",
      },
    },
  ],

  set Alf(value: any) {
    Alf = value;
  },
  set Text(value: any) {
    Text = value;
  },
  set InlineLinkText(value: any) {
    InlineLinkText = value;
  },

  renderVersion: withErrorBoundary(() => {
    const t = useTheme();

    return (
      <>
        <Text style={{ ...t.atoms.text_contrast_medium, lineHeight: 1.3 }}>
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
