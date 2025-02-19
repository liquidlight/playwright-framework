---
title: Dynamic hosts
nav_order: 2
parent: Customisation
---

# Dynamic hosts

The dynamic hosts functionality allows you to change the host (domain name) based on an environment variable. This allows you to write your tests for one host, but change the target as you run the test.

The main benefit of this is for visual regression; it allows you to take snapshots of the live site and compare it to your local version without altering your tests.

You can use this functionality independently to the rest of the framework config & features.

## Usage

To use the dynamic hosts function you need to have 2 things

1. A `hosts` array in your Playwright config
2. Your test uses the `test` function from `@liquidlight/playwright-framework`

Once configured you can pass in the environment variable when you run the tests.

`PLAYWRIGHT_ENV` defaults to "local".

```bash
npx playwright test
```

Then to use your production host:

```bash
PLAYWRIGHT_ENV=production npx playwright test
```

## Setup

First, add a `hosts` array to your Playwright config with an object of key/value pairs with the environment and URL.

You can add this in two ways, using the [`configuration` function](./configuration-function) or by manually adding it to the config

### Configuration

**Note:** If you are using TYPO3, you can use the [`typo3site` function](./typo3site).

#### Configuration function

To add it using the configuration function, it is passed in to the first object

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration({
		hosts: [{
			production: 'https://www.liquidlight.co.uk',
			local: 'https://liquidlight.ddev.site'
		}]
	})
);
```

#### Custom config

Alternatively, you can set it directly in the config

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	...
	hosts: [{
		production: 'https://www.liquidlight.co.uk',
		local: 'https://liquidlight.ddev.site'
	}]
})
```

### Tests

In your test, you can replace `@playwright/test` with `@liquidlight/playwright-framework` to utilise the test fixture.

**Note** `@liquidlight/playwright-framework` exports everything that `@playwright/test` does to make your files a bit neater

```ts
import { test, expect } from '@playwright/test';


test('Some test name', async ({ page }) => {
	page.goto('https://www.liquidlight.co.uk');
	expect(page.url()).toBe('https://liquidlight.ddev.site');
});
```

This above test will then pass on local, but fail if any other environment is used.
