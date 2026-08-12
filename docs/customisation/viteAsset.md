---
title: viteAsset function
nav_order: 5
parent: Customisation
---

# `viteAsset` function

The framework comes with a `viteAsset` function to resolve a Vite manifest entry to its built, hashed asset path, saving you from manually reading and parsing `manifest.json` in every test.

## Example

```ts
import { viteAsset } from '@liquidlight/playwright-framework';

await page.setContentAndScriptTag(
	`
		...
	`,
	viteAsset('app/sites/site_package/Resources/Private/JavaScript/core.js')
);
```

## More details

By default, `viteAsset` reads the manifest from `html/_assets/vite/.vite/manifest.json` (relative to `process.cwd()`) and returns the built asset path prefixed with `html/_assets/vite/`.

If your project builds Vite assets to a different location, pass a second argument to override the base path:

```ts
viteAsset('app/sites/site_package/Resources/Private/JavaScript/core.js', 'dist/vite');
```

This looks for the manifest at `dist/vite/.vite/manifest.json` and returns paths prefixed with `dist/vite/`.

An error is thrown if the requested entry isn't found in the manifest.
