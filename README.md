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

If you wish to use the production domain (or any other domain set in the `envs` object) you can by modiying the `PLAYWRIGHT_ENV` var

For example:

```
PLAYWRIGHT_ENV=staging ./node_modules/.bin/playwright test
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

- The `/testbed/` is optional, see the [testbed docs](./docs/testbed) for more info
- The `*test.ts-snapshots/` is option, depending if you want to commit your snapshots/screenshots


### Scripts

If you wish to set up `npm run test`, you can add the following to your `package.json`

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

## Releasing

When it comes to releasing, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. `npm update` & commit result
5. `git tag [version]`
6. `git push origin main --tags`
7. `npm publish`
