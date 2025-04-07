import type { PluginDef } from "api";
import betterTextInput from "plugins/betterTextInput";
import core from "plugins/core";

export const pluginDefs = [
  core,

  betterTextInput,
] as PluginDef[];
