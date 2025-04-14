export const _export = (id: string, mod: any) => require.cache[id] = mod;

const require = (mod: string) => require.cache[mod];

require.cache = {} as Record<string, any>;
// @ts-ignore
window.require = require;
