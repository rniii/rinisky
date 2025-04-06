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

export const getModule = (...filter: string[]) => {
  for (const id in wreq.c) {
    const m = wreq.c[id];
    if (!m?.loaded || !m.exports) {
      continue;
    }

    if (filter.every(f => typeof m.exports == "object" && f in m.exports)) {
      return m.exports;
    }
  }
};

export const lazyModule = (...filter: string[]) => lazy(() => getModule(...filter));

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
