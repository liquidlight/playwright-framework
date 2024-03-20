# Playwright Framework

This is a wrapper/meta framework around [Playwright](https://playwright.dev/) - an end-to-end testing framework. This is a central configuration repository which allows us to update settings and config for all our projects.

> [!NOTE]
> More documentation can be found in [the docs folder](./docs/)

## Get Started

### Install

```
npm i @liquidlight/playwright-framework -D --save
```

### Playwright Config

Create a `playwright.config.ts` with the following contents:

```typescript
import { defineConfig } from '@playwright/test';

const config = require('@liquidlight/playwright-framework')([
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
```

- A Playwright project is made for each [default device](https://github.com/liquidlight/playwright-framework/blob/main/docs/2-configuration.md#default-devices) (e.g. the above config will make two PLaywright Projects)
- Everything passed into the `project` object inside the site will be passed directly to each [project](https://playwright.dev/docs/test-projects)
- If you pass `devices` as an array of strings, a project will be made per device (or you can not use any device by passing an empty array)

More details on how the configuration works can be found [in the docs](./docs/2-configuration.md). If you are running a TYPO3 site, it's worth checking out the [TYPO3 documentation](./docs/5-typo3.md).

> [!TIP]
> By setting local & production domains (and other), the framework can use these domains for your tests without needing to specify the full URL

### Your first test

In the `testDir` specified, create a new file with the following contents. This will test the accessibility of your homepage.

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

- The `@vr` stands for visual regression - if you tag any [visual regression](https://github.com/liquidlight/playwright-framework/blob/main/docs/6-example-tests.md#visual-regression-test) tests with this, it can save you from running them every time
- The `test:update` will inly update jobs tagged with `@snapshot`
- Utilise `npx playwright codegen` to help generate tests

## Releasing

When it comes to releasing, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. `npm update` & commit result
5. `git tag [version]`
6. `git push origin main --tags`
7. `npm publish`
