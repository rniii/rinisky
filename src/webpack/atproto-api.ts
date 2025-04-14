import { _export } from "fake-require";
import { lazyModule } from "webpack";

const atproto = lazyModule("RichText", "RichTextSegment");

_export("@atproto/api", atproto);
