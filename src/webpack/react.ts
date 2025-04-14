import { _export } from "fake-require";
import { lazyModule } from "webpack";

const React = {
  Fragment: Symbol.for("react.fragment"), // can't be used lazily
} as any;

React.default = React;

Object.setPrototypeOf(React, lazyModule("createElement", "Fragment"))

_export("react", React);
