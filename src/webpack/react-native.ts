/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { _export } from "fake-require";

const ReactNative = {
  StyleSheet: {
    create: (styles: any): any => styles,
  },
};

// const StyleSheet = lazyModule("compose", "absoluteFillObject") as typeof import("react-native").StyleSheet;
// const { View } = lazyModule("View", "Text", "Image") as typeof import("react-native");

_export("react-native", ReactNative);
