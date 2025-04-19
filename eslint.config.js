/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// @ts-check
import js from "@eslint/js";
import ts from "typescript-eslint";

import simpleHeader from "eslint-plugin-simple-header";

export default ts.config(
  { ignores: ["dist"] },
  js.configs.recommended,
  ts.configs.recommended,
  { rules: ts.configs.eslintRecommended.rules },
  {
    rules: {
      "no-constructor-return": "warn",
      "no-self-compare": "warn",
      "no-unmodified-loop-condition": "warn",
      "no-unreachable-loop": "warn",
      "eqeqeq": ["error", "smart"],

      "logical-assignment-operators": ["warn", "always"],
      "no-alert": "error",
      "no-array-constructor": "error",
      "no-else-return": "warn",
      "no-empty-static-block": "warn",
      "no-extra-label": "warn",
      "no-invalid-this": "warn",
      "no-label-var": "warn",
      "no-lone-blocks": "warn",
      "no-lonely-if": "warn",
      "no-useless-rename": "warn",
      "no-var": "error",
      "one-var": ["error", "never"],
      "operator-assignment": ["warn", "always"],
      "prefer-exponentiation-operator": "warn",
      "prefer-object-spread": "warn",
      "yoda": "warn",

      // "@typescript-eslint/prefer-fun": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-empty-pattern": "off",
    },
  },
  {
    plugins: { "simple-header": simpleHeader },
    rules: {
      "simple-header/header": ["error", {
        files: ["scripts/header.txt", "scripts/header-long.txt"],
        templates: { author: [".*", "rini and contributors"] },
      }],
    },
  },
);
