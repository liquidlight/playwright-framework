# Playwright Configuration

In the `playwright.config.ts`, you can use and extend the `@liquidlight/playwright-framework` function. This takes two parameters - an array of `Site` objects (see [the [Site type definition](./types.ts)]) and an array of Playwright [device descriptors](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json).

It returns a Playwright-ready object which you can pass directly to the `deinfeConfig` function, or you can use the spread operator to override any settings.

## Quick Config Setup

If you're after a quick starter, copy and paste the below

```js
import { defineConfig } from '@playwright/test';

const config = require('@liquidlight/playwright-framework')(
    {
        label: 'Site name',
        envs: {
            production: 'https://www.liquidlight.co.uk',
        },
        project: {
            testDir: './path/to/site/files/'
        }
    }
]);

module.exports = defineConfig(config);
```

Add a new site object for each website - a second parameter can be passed in to overwrite the [default devices](#default-devices).

## Longer Description

```js
import { defineConfig } from '@playwright/test';

const config = require('@liquidlight/playwright-framework')(
    [], // Array of Sites
    [] // Array of devices
);

module.exports = defineConfig(config);
```

### Site object

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

## Default Devices

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
