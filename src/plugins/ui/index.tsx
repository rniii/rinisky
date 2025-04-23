/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type ComponentType, useContext } from "react";
import { type TextProps as RNTextProps } from "react-native";

import { definePlugin, re } from "api";

let AlfContext: React.Context<{
  themeName: "light" | "dim" | "dark";
  theme: {
    palette: Record<string, string>;
    atoms: Record<string, React.CSSProperties>;
  };
  fonts: {
    scale: "-2" | "-1" | "0" | "1" | "2";
    scaleMultiplier: number;
    family: "system" | "theme";
  };
}>;

export let a: Record<string, React.CSSProperties>;
export let Text: ComponentType<RNTextProps & any> = ({ children }) => <div>{children}</div>;

export const useAlf = () => useContext(AlfContext);
export const useTheme = () => useAlf().theme;

export default definePlugin({
  required: true,

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
});
