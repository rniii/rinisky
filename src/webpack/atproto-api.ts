import { lazyModule } from "webpack";

export const { RichText } = lazyModule("RichText", "RichTextSegment") as typeof import("@atproto/api");

export type RichText = import("@atproto/api").RichText
