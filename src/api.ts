/**
 * Puts a function's result behind a lazy proxy.
 *
 * Can be recursively destructured:
 *
 * ```js
 * const { foo } = lazy(() => console.log('this will not run, yet'))
 * ```
 */
export const lazy = <T extends object>(get: () => T) => {
  let cached: any;
  let sameTick = true;
  setTimeout(() => sameTick = false);

  return new Proxy<T>(function() {} as any, {
    get: (_, key) =>
      sameTick
        ? lazy(() => (cached ??= get())[key])
        : Reflect.get(cached ??= get(), key),
    set: (_, key, val) => Reflect.set(cached ??= get(), key, val),
    apply: (_, that, args) => Reflect.apply(cached ??= get(), that, args),
    construct: (_, args) => Reflect.construct(cached ??= get(), args),
  });
};

/**
 * Makes regex for source code easier to read. Special characters (`.*+?^${([)|`) are used with
 * escapes instead (i.e. `\.\*`)
 *
 * \i is an alias for a regex that matches any JavaScript identifier
 */
export const re = (template: TemplateStringsArray) => {
  const raw = template.raw[0];
  const flags = raw.match(/^\(\?([a-z]+)\)/);
  const regex = new RegExp(
    raw
      .slice(flags?.[0].length)
      .replace(/\\*[.*+?^${([)|]/g, (m) => m.length % 2 ? "\\" + m : m.slice(1))
      .replace(/\\i/g, "[A-Za-z_$][\\w$]*"),
    flags?.[1],
  );
  regex.toString = () => "re`" + raw + "`";
  return regex;
};

export interface ReplacementDef {
  match: string | RegExp;
  replace: string | Function;
}

export interface PatchDef {
  query?: string | string[];
  patch: ReplacementDef | ReplacementDef[];
}

export interface PluginDef {
  name: string;
  patches?: PatchDef[];
  start?(): void;
}

export const define = <T extends PluginDef>(m: T & Record<string, any>) => m;
