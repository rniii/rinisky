/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { type ComponentType, type CSSProperties, type ReactNode } from "react";
import { type TextProps as RNTextProps } from "react-native";

import { definePlugin, re } from "api";

let AlfContext: any;
export let a: Record<string, CSSProperties>;
export let Text: ComponentType<RNTextProps & any> = ({ children }) => <div>{children}</div>;
export let InlineLinkText: ComponentType<{ children?: ReactNode; to: string } & any> = ({ children, to }) => (
  <a href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export const useTheme = () => {
  const alf = React.useContext<any>(AlfContext);

  return React.useMemo(() => alf.theme, [alf]);
};

export default definePlugin({
  name: "CoreUI",
  patches: [
    {
      patch: {
        match: re`\i=\(\?={debug:{borderColor:"red"\)`,
        replace: "$&$self.atoms=",
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

  set atoms(value: any) {
    a = value;
  },
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
