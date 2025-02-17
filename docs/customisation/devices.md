---
title: Devices & Projects
nav_order: 3
parent: Customisation
---

When using the [configuration function](./configuration-function) to generate your baseline config, there are 3 preconfigured projects by default. These are:

```
['Desktop Edge', 'Desktop Safari', 'iPhone 14']
```

These devices are part of Playwright and you can see a [full list of available emulators](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) on Github.

The order of the devices does matter, as it will affect which device runs the `spec.ts` tests (covered under [Dynamic tests](./dynamic-tests)).

## Customisation

To change the devices used, you can either:

- Using the `PLAYWRIGHT_DEVICES` environment variable
- Pass an array of devices through in the `options` object of the [configuration function](./configuration-function)
- Override the `projects` object once the base configuration has been generated

The `PLAYWRIGHT_DEVICES` will take precedence anything passed in to the `options` object.

## Examples

### Using the `PLAYWRIGHT_DEVICES` environment variable

You can pass this through on the command line

```bash
PLAYWRIGHT_DEVICES="Blackberry PlayBook,Desktop Chrome" npx playwright test
```

### Using the options object

```ts
import {defineConfig, configuration} from '@liquidlight/playwright-framework';

const config = configuration({
	devices: ['Blackberry PlayBook']
});
export default defineConfig(config);
```

### Overriding projects

**Note:** This removes the dynamic test functionality

```ts
import {defineConfig, configuration, devices} from '@liquidlight/playwright-framework';

const config = configuration();

config.projects = [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
];

export default defineConfig(config);
```