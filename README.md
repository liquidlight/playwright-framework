# Playwright Framework

This is a wrapper/meta framework around [Playwright](https://playwright.dev/) - an end-to-end testing framework. This is a central configuration repository which allows us to update settings and config for all our projects.

> [!NOTE]
> More documentation can be found in [the docs folder](./docs/)

## Naming Conventions

- `*.unit.ts` - These are unit tests and should **not** open the browser - they are **only** run by the first device
- `*.spec.ts` - These should test functionality and open the browser - they are **only** run by the first device
- `*.test.ts` - These should be used for end-to-end testing and are run by all the devices specified

## Get Started

> [!WARNING]
> This uses ESM. If your project uses CommonJS, you will need to use [v0.4.0-beta.1](https://github.com/liquidlight/playwright-framework/tree/0.4.0-beta.1)
>
> Alternatively, you can set your config file to be named `playwright.config.mts` (note the `mts` file extension)

ESM projects can be identified by checking your `package.json` to see if it has `"type": "module"`

The steps are:

1. [Install](#install)
2. [Set up the config](#playwright-config)
3. [Create & run a test](#your-first-test)
4. [Add folders to `.gitginore`](#gitignore)
5. [Add scripts to `package.json`](#scripts)

### Install

```
npm i @liquidlight/playwright-framework -D --save
```

### Playwright Config

> [!TIP]
> If you are running a TYPO3 site, it's worth checking out the [Liquid Light Playwright Framework TYPO3 documentation](./docs/5-typo3.md).

Create a `playwright.config.ts` with the following contents:

```typescript
import { defineConfig } from '@playwright/test';
import { framework } from '@liquidlight/playwright-framework';

const config = framework([
    {
        label: 'Site name',
        envs: {
            local: 'https://liquidlight.ddev.site',
            production: 'https://www.liquidlight.co.uk',
        },
        project: {
            testDir: './path/to/site/files/'
        }
    }
]);

export default defineConfig(config);
```

- A Playwright project is made for each [default device](https://github.com/liquidlight/playwright-framework/blob/main/docs/2-configuration.md#default-devices) (e.g. the above config will make two PLaywright Projects)
- Everything passed into the `project` object inside the site will be passed directly to each [project](https://playwright.dev/docs/test-projects)
- If you pass `devices` as an array of strings, a project will be made per device (or you can not use any device by passing an empty array)
- If you have a TYPO3 website, there is a specific `typo3Config` function to [you can use to generate the config](./docs/5-typo3.md)

More details on how the configuration works can be found [in the docs](./docs/2-configuration.md).

> [!TIP]
> By setting local & production domains (and other), the framework can use these domains for your tests without needing to specify the full URL

### Your first test

In the `testDir` specified, create a new file (e.g. `newtest.test.ts`)with the following contents. This will test the accessibility of your homepage.

```typescript
import { test } from '@playwright/test';
import { assertPageIsAccessible } from '@liquidlight/playwright-framework/tests';

/**
 * Ensure our base page template is accessible
 */
test('"Tests" page is accessible', async ({ page }, testInfo) => {
    await page.goto('/');

    await assertPageIsAccessible(page, testInfo);
});
```

### Run the test

```
./node_modules/.bin/playwright test
```

By default, this will use the `local` environment (unless that domain hasn't been specified, then it uses production).

#### Change the environment

If you wish to use the production domain (or any other domain set in the `envs` object) you can by modifying the `PLAYWRIGHT_ENV` var or passing in an `--env` flag

For example:

```
PLAYWRIGHT_ENV=staging ./node_modules/.bin/playwright test
```

or

```
./node_modules/.bin/playwright test --env=staging
```

### `.gitignore`

Add the following to your `.gitignore` file:

```bash
# Playwright Tests
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/testbed/
*test.ts-snapshots/
```

**Notes**

- The `/testbed/` is optional, see the [testbed docs](./docs/testbed) for more info
- The `*test.ts-snapshots/` is option, depending if you want to commit your snapshots/screenshots


### Scripts

If you wish to set up `npm run test`, you can add the following to your `package.json`

```json
{
 "scripts": {
    "test": "playwright test --grep-invert @vr",
    "test:vr": "playwright test --grep @vr",
    "test:update": "playwright test --update-snapshots --grep @snapshot",
    "test:open": "monocart show-report test-results/report.html"
  },
}
```

**Notes**

- The `@vr` stands for visual regression - if you tag any [visual regression](https://github.com/liquidlight/playwright-framework/blob/main/docs/99-example-tests.md#visual-regression-test) tests with this, it can save you from running them every time
- The `test:update` will inly update jobs tagged with `@snapshot`
- Utilise `npx playwright codegen` to help generate tests

## Releasing this Playwright Framework

When it comes to creating a new release for the Playwright Framework, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. Commit result
5. `git tag [version]`
6. `git push origin main --tags` - this will publish to NPM

## Local Development of the Playwright Framework

1. Clone the repository down parallel to your project
2. Run `npm install`
2. Run `npm run pack`
3. In your project, delete `node_modules/@liquidlight/playwright-framework`
4. Update the `package.json` in the project to be `"@liquidlight/playwright-framework": "file:./../playwright-framework/liquidlight-playwright-framework-0.4.0-beta.1.tgz"` (or whatever the tgz file made is)
5. Run `npm update` in the project

If you make changes to the package, run `npm run pack` in the package and `npm update` in the project
