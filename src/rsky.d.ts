/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

declare module "~plugins" {
  const plugins: import("api").Plugin[];
  export default plugins;
}

declare const RSKY_VERSION: string;
declare const RSKY_COMMIT: string;
