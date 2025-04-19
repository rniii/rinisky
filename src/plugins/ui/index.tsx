/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { type CSSProperties, type ReactNode } from "react";

import { definePlugin, re } from "api";

let AlfContext: any;

export let Text = ({ children, style }: { children: ReactNode; style: CSSProperties }): ReactNode => {
  return <div style={style}>{children}</div>;
};

export let InlineLinkText = ({ children, to }: { children: ReactNode; to: string }) => {
  return <a href={to} target="_blank">{children}</a>;
};

export const useTheme = () => {
  const alf = React.useContext<any>(AlfContext);

  return React.useMemo(() => alf.theme, [alf]);
};

export default definePlugin({
  name: "CoreUI",
  patches: [
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
    AlfContext = value;
  },
  set Text(value: any) {
    Text = value;
  },
  set InlineLinkText(value: any) {
    InlineLinkText = value;
  },
});
