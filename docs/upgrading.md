---
title: Upgrading to v2
nav_order: 98
---

# Upgrading to v2

## Package

Update your `package.json` to use `^2.0.0` or run 

```
npm i @liquidlight/playwright-framework@2.0.0
```

## Files

### Tests

1. Replace `@playwright/test` with `@liquidlight/playwright-framework`
2. Any intance of `page.goto()` now needs to include a domain/host ([Read more about dynamic hosts](https://liquidlight.github.io/playwright-framework/customisation/dynamic-hosts.html))

For example:

```diff
-import { test, expect } from '@playwright/test';
+import { test, expect } from '@liquidlight/playwright-framework';

test('Language Switcher - Desktop', async({ page }) => {
-	await page.goto('/');
+   await page.goto('https://liquidlight.ddev.site/');
	await page.getByRole('button', { name: 'English' }).click();
	await page.getByRole('link', { name: 'Français' }).click();

	await expect(page.getByRole('button', { name: 'Français' })).toBeVisible();
});

```

### `playwright.config.ts`

1. Copy the [example configuration](https://liquidlight.github.io/playwright-framework/installation.html#create-configuration) from the docs into your config file
2. Move the `envs` object from your [site config](https://github.com/liquidlight/playwright-framework/blob/0.4.0-beta.1/README.md#playwright-config) and pass it into the `hosts` array in the [`configuration` function](https://liquidlight.github.io/playwright-framework/customisation/configuration-function.html)

#### From v1

#### From v0

```diff
-import { defineConfig } from '@playwright/test';
+import { configuration, defineConfig } from '@liquidlight/playwright-framework';

-const config = require('@liquidlight/playwright-framework')([
-   {
-        label: 'Site name',
-        envs: {
            local: 'https://liquidlight.ddev.site',
            production: 'https://www.liquidlight.co.uk',
-        },
-        project: {
-            testDir: './path/to/site/files/'
-        }
-    }
-]);
-module.exports = defineConfig(config);

+export default defineConfig(
+	configuration({
+		hosts: [
+			{
				local: 'https://liquidlight.ddev.site',
                production: 'https://www.liquidlight.co.uk',
+			}
+		]
+	})
+);
```

##### TYPO3

If you are using the `typo3Config`, include the new `typo3site` method inside the `hosts` array and remove the file path. [See an exmaple in the docs](https://liquidlight.github.io/playwright-framework/customisation/typo3site.html).

```diff
- import { defineConfig } from '@playwright/test';
- import typo3Config from '@liquidlight/playwright-framework/typo3';

- const config = require('@liquidlight/playwright-framework')([
-    typo3Config('liquidlight', './path/to/files')
-]);
-module.exports = defineConfig(config);

+export default defineConfig(
+	configuration({
+	hosts: [
+			typo3site('liquidlight')
+		]
+	})
+);
```