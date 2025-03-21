---
title: Quick Start
nav_order: 3
---

# Quick Start
{: .no_toc }

If you've used the framework before and just want to set it up. If you're new, [check out the installation guide](./installation).

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Install

```bash
npm i @liquidlight/playwright-framework --save-dev
```

**Note:** Depending on your local `npm` set up (if you have `save=false` in your `.npmrc` file), you may need `npm i @liquidlight/playwright-framework --save -D` instead

## Create configuration

`playwright.config.ts`

### Standard

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration({
		hosts: [
			{
				local: 'https://local.ddev.site/',
				production: 'https://www.livedomain.com/',
			}
		]
	})
);
```

### TYPO3

```ts
import { defineConfig, configuration, typo3site } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration({
		hosts: [
			typo3site('site')
		]
	})
);
```


## Create a test


```ts
import { test, expect } from '@liquidlight/playwright-framework';

test('Test description', async ({ page }) => {
	await page.goto('https://www.liquidlight.co.uk');
	await expect(page.url()).toBe('https://www.liquidlight.co.uk');
});
```

## `.gitignore`

```
# Playwright Tests
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
*.ts-snapshots/
```

## `package.json` scripts

```json
{
	"scripts": {
		"test": "playwright test --grep-invert @vr",
		"test:vr": "playwright test --grep @vr",
		"test:update": "playwright test --update-snapshots --grep @snapshot",
		"test:open": "monocart show-report test-results/report.html"
	}
}
```

## Change the environment

```
PLAYWRIGHT_ENV=production npm run test
```
