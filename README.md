# Playwright Framework

This is a wrapper/meta framework around [Playwright](https://playwright.dev/) - an end-to-end testing framework. This is a central configuration repository which allows us to update settings and config for all our projects.

```
npm i @liquidlight/playwright-framework -D --save
```

- [Playwright Framework](#playwright-framework)
    - [Overview](#overview)
    - [Setup](#setup)
    - [Playwright Configuration](#playwright-configuration)
        - [Quick Config Setup](#quick-config-setup)
        - [Longer Description](#longer-description)
            - [Site object](#site-object)
        - [Default Devices](#default-devices)
        - [Testbed](#testbed)
            - [Setup](#setup-1)
            - [Customisation](#customisation)
        - [TYPO3](#typo3)
    - [Example Tests](#example-tests)
        - [Visual Regression Test](#visual-regression-test)
        - [PDF Download](#pdf-download)
    - [Releasing](#releasing)

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

```bash
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/testbed/
```

(The `/testbed/` is optional, see the [docs below](#testbed) for more info)

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

> [!NOTE]
> A variable should be passed into `defineConfig` so that the VSCode extension can extract the tests.

Add a new site object for each website - a second parameter can be passed in to overwrite the [default devices](#default-devices).

### Longer Description

```js
import { defineConfig } from '@playwright/test';

const config = require('@liquidlight/playwright-framework')(
    [], // Array of Sites
    [] // Array of devices
);

module.exports = defineConfig(config);
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

```js
['Desktop Edge', 'iPhone 14']
```

If you want to use the default devices and add any additional ones, you can do so with the spread syntax

```js
import { defineConfig } from '@playwright/test';
import { defaultDevices } from '@liquidlight/playwright-framework/utils';

const config = require('@liquidlight/playwright-framework')(
    [] // Sites
    [
        ...defaultDevices,
        'Desktop Firefox'
    ]
);

module.exports = defineConfig(config);
```

### Testbed

Sometimes you just want to throw a test together to check something on a bunch of browsers - this is where the testbed comes in.

Including the testbed in your project enables a whole host of devices to access a range of folders based on their properties. This allows you to create a file in a particular folder and not worry about setting up the tests.

#### Setup

Add the following to your `playwright.config.ts` and create a `testbed` folder in the root of your project

```js
import testbed from '@liquidlight/playwright-framework/testbed';
```

In inside your `projects` array, you can use the `testbed()` function

```js
module.exports = defineConfig({
    projects: [
        ...testbed()
    ]
});
```

The testbed comes with the following devices:

- Desktop Chrome
- Desktop Firefox
- Desktop Safari
- Desktop Edge
- Pixel 5
- iPhone 12

And runs tests based on the [device specification](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) within the `testbed` folder.

If the test file is:

- In the root of your project: All devices run it
- In a folder called `desktop` or `mobile`: Devices based on the `isMobile` boolean
- In a folder based on the `defaultBrowserType` - only those select browsers will run it
- In a folder of a "slugified" version of the name (e.g. `desktop-chrome`): Only that device will run it

For example, with the devices listed above above, imaging the following structure:

```
testbed
├── desktop
├── pixel-5
└── webkit
```

- Tests in `desktop` would be run by Desktop Chrome, Desktop Firefox, Desktop Safari and Desktop Edge
- Tests in `pixel-5` would be run by Pixel 5
- Tests in `webkit`  would be run by iPhone 12

#### Customisation

The `testbed()` function takes 2 arguments, an array of device names and a folder name for the base testbed folder

```js
testbed(
	browsers: string[] = [],
	folder: string = ''
)
```

### TYPO3

If you use TYPO3 as your CMS of choice, you can auto generate your site config objects.

```js
import { defineConfig } from '@playwright/test';
import typo3Sites from '@liquidlight/playwright-framework/typo3';

const config = require('@liquidlight/playwright-framework')(
    typo3Sites()
);

module.exports = defineConfig(config);
```

**Note**: This function makes several assumptions

- Your site config is in `config/sites/*/config.yaml`
- You use `applicationContext` for different environments
- Your site config uses full TLDs
- Your site_package code is in `./app/sites/[site_name]` - where `[site_name]` matches the site config folder (I realise this is a biggy, if you would like customisation then raise an issue)

If you wish to combine TYPO3 & the testbed functionality, this can be done so like:

```js
import { defineConfig } from '@playwright/test';
import typo3Sites from '@liquidlight/playwright-framework/typo3';
import testbed from '@liquidlight/playwright-framework/testbed';

const config = require('@liquidlight/playwright-framework')(
	typo3Sites()
);

config.projects.push(...testbed());

module.exports = defineConfig(config);
```

## Example Tests

Although this is covered in the Playwright documentation, it's useful to have some copy and paste examples

### Visual Regression Test

> [!NOTE]
> This will fail on the first time as it doesn't have a comparison

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

## Releasing

When it comes to releasing, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. `npm update` & commit result
5. `git tag`
6. `git push origin main --tags`
7. `npm publish`
