import { lazy } from "api";

export interface WebpackFactory {
  (module: WebpackModule, exports: any, require: typeof wreq): any;
}

export interface WebpackModule {
  id: number;
  loaded: boolean;
  exports: any;
}

export let wreq: {
  m: Record<number, WebpackFactory>;
  c: Record<number, WebpackModule>;
  (id: number): WebpackModule;
};

export const _registerWreq = (value: typeof wreq) => wreq = value;

export const findModule = (...props: string[]) => {
  for (const id in wreq.c) {
    const m = wreq.c[id];
    if (!m?.loaded || !m.exports || typeof m.exports != "object") {
      continue;
    }

    if (props.every(f => f in m.exports)) {
      return m.exports;
    }

    if (!m.exports.default || typeof m.exports.default != "object" && typeof m.exports.default != "function") {
      continue;
    }

    if (props.every(f => f in m.exports.default)) {
      return m.exports.default;
    }
  }
};

export const lazyModule = (...props: string[]) => lazy(() => findModule(...props));

export const search = (...query: string[]) => {
  let results = [] as any[];

  for (const id in wreq.m) {
    let code: string;
    try {
      code = Function.prototype.toString.call(wreq.m[id]);
    } catch {
      continue;
    }

    if (query.every(m => code.includes(m))) {
      results.push(wreq.c[id]);
    }
  }

  if (results.length > 1) {
    console.warn("multiple results for query");
    return results;
  }
  if (results.length === 1) {
    return results[0];
  }
  console.warn("no match for query");
  return null;
};
