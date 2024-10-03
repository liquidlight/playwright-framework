# Testbed

Sometimes you just want to throw a test together to check something on a bunch of browsers - this is where the testbed comes in.

Including the testbed in your project enables a whole host of devices to access a range of folders based on their properties. This allows you to create a file in a particular folder and not worry about setting up the tests.

## Setup

Add the following to your `playwright.config.ts` and create a `testbed` folder in the root of your project

```js
import { testbed } from '@liquidlight/playwright-framework';
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

## Customisation

The `testbed()` function takes 2 arguments, an array of device names and a folder name for the base testbed folder

```js
testbed(
    browsers: string[] = [],
    folder: string = ''
)
```
