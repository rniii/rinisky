/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "webpack/react-runtime";

import type { ComponentClass, ErrorInfo, FunctionComponent, ReactNode } from "react";
import React from "react";

type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

export const flatten = <T,>(obj: T): Flatten<T> => Object.assign({}, ...[obj].flat(1 / 0));

export const lazyComponent = <P extends object>(get: () => ComponentClass<P>) => {
  let CachedComponent: any;

  return (props: P) => {
    CachedComponent ??= get();

    return <CachedComponent {...props} />;
  };
};

export const ErrorBoundary = lazyComponent(() =>
  class extends React.Component<{ fallback?: ReactNode; children: ReactNode }, { error?: string }> {
    constructor(p: any) {
      super(p);
      this.state = {};
    }

    static getDerivedStateFromError(error: any) {
      return { error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error("Component error:", error);
      console.error(errorInfo.componentStack);
    }

    render() {
      return this.state.error
        ? this.props.fallback ?? <div title={this.state.error}>{"Something went wrong :<"}</div>
        : this.props.children;
    }
  }
);

export const withErrorBoundary = <P extends object>(Component: FunctionComponent<P>) => {
  return (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};
