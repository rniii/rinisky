import { lazyModule } from "webpack";

export const React = lazyModule("createElement", "Fragment") as typeof import("react")

export const { createElement } = React
export const Fragment = Symbol.for("react.fragment")
