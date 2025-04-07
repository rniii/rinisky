import { lazyModule } from "webpack";

export const React = lazyModule("createElement", "Fragment") as typeof import("react");

export const { createElement } = React;
export const Fragment = /* @__PURE__ */ Symbol.for("react.fragment"); // can't be used lazily
