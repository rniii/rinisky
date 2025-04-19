/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { _export } from "fake-require";
import { lazyModule } from "webpack";

const atproto = lazyModule("RichText", "RichTextSegment");

_export("@atproto/api", atproto);
