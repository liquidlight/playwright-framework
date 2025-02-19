---
title: Installation
nav_order: 2
---

# Installation
{: .no_toc }

If you've used this library before and just want to set it up again, check out the [quick start](./quick-start.html)

## Table of Contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Install

First, install the NPM module

```bash
npm i @liquidlight/playwright-framework -D --save
```

## Create configuration

Create a `playwright.config.ts` for your playwright configuration and include the `configuration` function from the framework

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

{: .info }
The `hosts` configuration is there for the dynamic host switching - if you don't wish to use this functionality you can remove the key

{: .success }
If your website runs on TYPO3, the host data can be gathered from the site config by using the [`typo3site` function](./customisation/typo3site.html)


## Create a test

Create a test with the suffix of `.unit.ts`, `.spec.ts` or `.test.ts` following the [Playwright "Writing Tests" documentation](https://playwright.dev/docs/writing-tests).

The only difference is you need to use the `test` and `expect` function from this framework instead of the default Playwright ones

```ts
import { test, expect } from '@liquidlight/playwright-framework';
```

## `.gitignore`

Add the following to you `.gitignore` file

```
# Playwright Tests
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
*.ts-snapshots/
```

{: .info }
If you wish to commit your Visual Regression results, then remove the `*.ts-snapshots/` line

## Run the test

You can run Playwright tests using the default `npx` runner.

```
npx playwright test
```

### `package.json` scripts

However, for consistency and quick set-up, we prefer to add the following to the `scripts` block in `package.json`

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

{: .note }
> - The `@vr` stands for visual regression - if you tag any visual regression tests with this, it can save you from running them every time
> - The `test:update` will inly update jobs tagged with `@snapshot`
> - Utilise `npx playwright codegen` to help generate tests
