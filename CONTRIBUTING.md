# Contributing plugins

Since we're both Webpack mods, most of Vencord's [documentation](https://github.com/Vendicated/Vencord/blob/main/CONTRIBUTING.md)
applies.

It is early in development so I will not bikeshed much of the contributing process

## Bluesky's Webpack 101

Its recommended you have a local clone of [bluesky-social/social-app](https://github.com/bluesky-social/social-app)
to poke around the code, but you will have to be comfortable looking at minified code as well.

In the Debugger (Firefox) or Sources (Chrome) tab you'll see something like `Webpack53809` under
Webpack. These are the modules after they are patched by the mod. Under web-cdn.bsky.app,
`main.[hash].js` is the primary chunk before patching. You'll want to enable formatting for these
files if you want to make sense of anything.

Bluesky's entire source gets compiled to one webpack module, which is most of the main chunk.
Currently* the lazy-loaded chunks are not patched, but you can require dependencies from them after
they're loaded. For plugins changing the UI code when they are loaded is irrelevant.

\* if it is necessary to patch a lazy chunk please let me know. I am just lazy as well.

## How do I do things???

I dont know, look around
