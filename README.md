# Playwright Framework

This is a wrapper/meta framework around [Playwright](https://playwright.dev/) - an end-to-end testing framework. This is a central configuration repository which allows us to update settings and config for all our projects.

- [Playwright Framework](#playwright-framework)
    - [Overview](#overview)
    - [Setup](#setup)
    - [Playwright Configuration](#playwright-configuration)
        - [Quick Config Setup](#quick-config-setup)
        - [Longer Description](#longer-description)
            - [Site object](#site-object)
        - [Default Devices](#default-devices)
        - [TYPO3](#typo3)
    - [Example Tests](#example-tests)
        - [Visual Regression Test](#visual-regression-test)
        - [PDF Download](#pdf-download)

## Overview

Playwright requires 1 device per "[project](https://playwright.dev/docs/test-projects)", so if you wish to test a site on multiple devices, you need multiple projects. Some of our setups have multiple sites which quickly makes a gnarly config file.

This framework allows you to specify devices and sites as two separate arrays. It then builds up the projects for Playwright while keeping the user-facing config succinct. The default browsers can be overridden globally or on a specific site if required.

This framework assumes that each `Site` has a `testDir` specific to that particular site in your install

Also included are some common testing functions - specific search or accessibility tests we want to run. Having them centralised allows a cleaner test file in the project itself.

## Setup

Once the initial config is set up, you can then make more tests in the corresponding site's folder without needing to further edit your `playwright.config.ts`.

1. `npm i @liquidlight/playwright-framework -D --save` - Install this framework as a development dependency
2. Create a `playwright.config.ts` file in the root of your project - we'll fill that in in a bit
3. Add the following lines to your `.gitignore` file

```
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

4. **Optional** add the following the `scripts` block of your `package.json` - it makes it quicker to run the commands & saves you remembering them

```json
{
 "scripts": {
    "test": "playwright test",
    "test:update": "playwright test --update-snapshots",
    "test:open": "playwright show-report",
    "test:codegen": "playwright codegen"
  },
}
```

## Playwright Configuration

In the `playwright.config.ts`, you can use and extend the `@liquidlight/playwright-framework` function. This takes two parameters - an array of `Site` objects (see [the [Site type definition](./types.ts)]) and an array of Playwright [device descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json).

It returns a Playwright-ready object which you can pass directly to the `deinfeConfig` function, or you can use the spread operator to override any settings.

### Quick Config Setup

If you're after a quick starter, copy and paste the below

```js
import { defineConfig } from '@playwright/test';

module.exports = defineConfig(require('@liquidlight/playwright-framework')(
    {
        label: 'Site name',
        envs: {
            production: 'https://www.liquidlight.co.uk',
        },
        project: {
            testDir: './path/to/site/files/'
        }
    }
]));
```

Add a new site object for each website - a second parameter can be passed in to overwrite the [default devices](#default-devices).

### Longer Description

```js
import { defineConfig } from '@playwright/test';

module.exports = defineConfig(require('@liquidlight/playwright-framework')(
    [], // Array of Sites
    [] // Array of devices
));
```

#### Site object

The main enhancement of this playwright framework is to specify a single site object and let it be tested by all devices. The site object should look like the following:

```ts
interface Site {
	// A nice name for the site
	label: string;

	// Should this site have specific devices
	devices?: string[]

	// What URLs does this site respond on
	envs: {
		production: string
		local?: string
		staging?: string
	}

	// A Playwright project
	project: object
}
```

- `label`: A nice name for your project for tests & results - this gets concatenated with the environment and device
- `devices`: An optional array of devices to test this site on
- `envs`: This allows you to specify different URLs for different environments should you want to test on live or local etc.
- `project`: Anything passed in here will be merged with the [Playwright project](https://playwright.dev/docs/test-projects) object directly

### Default Devices

The second parameter of the framework function is an array of devices to test. By default these are the following, but can be overwritten with any [Playwright Device]([device descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json))

```
['Desktop Chrome', 'iPhone 12']
```

If you want to use the default devices and add any additional ones, you can do so with the spread syntax

```js
import { defineConfig } from '@playwright/test';
import { defaultDevices } from '@liquidlight/playwright-framework/utils';

module.exports = defineConfig(require('@liquidlight/playwright-framework')(
    [] // Sites
    [
        ...defaultDevices,
        'Desktop Firefox'
    ]
));

```

### TYPO3

If you use TYPO3 as your CMS of choice, you can auto generate your site config objects.

```js
import { defineConfig } from '@playwright/test';

import { typo3SiteConfigurationLocator } from './playwright-framework/typo3';

module.exports = defineConfig(require('@liquidlight/playwright-framework')(
	typo3SiteConfigurationLocator()
));

```

**Note**: This function makes several assumptions

- Your site config is in `config/sites/*/config.yaml`
- You use `applicationContext` for different environments
- Your site config uses full TLDs
- Your site_package code is in `./app/sites/[site_name]` - where `[site_name]` matches the site config folder (I realise this is a biggy, if you would like customisation then raise an issue)

## Example Tests

Although this is covered in the Playwright documentation, it's useful to have some copy and paste examples

### Visual Regression Test

**Note:** This will fail on the first time as it doesn't have a comparison

```ts
test(`Visual Comparison`, async({page}) => {
    await page.goto('/);

    await expect(page).toHaveScreenshot({
        fullPage: true
    });
});
```

### PDF Download

This relies on `download.path` which the [Playwright docs state](https://playwright.dev/docs/api/class-download#download-path):

> Returns path to the downloaded file for a successful download, or throws for a failed/canceled download.

```ts
import { test } from '@playwright/test';

test('Ensure standards translations are available', async ({ page }) => {
	await page.goto('/s');

    const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download' }).click();

    const download = await downloadPromise;
	await download.path();
});
```
