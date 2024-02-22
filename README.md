# Playwright Framework

This is a wrapper/meta framework around [Playwright](https://playwright.dev/) - an end-to-end testing framework. This is a central configuration repository which allows us to update settings and config for all our projects.

```
npm i @liquidlight/playwright-framework -D --save
```

> [!NOTE]
> All the docs can be found in [the docs folder](./docs/)

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

(The `/testbed/` is optional, see the [testbed docs](./docs/testbed) for more info)

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


## Releasing

When it comes to releasing, run the following:

1. `npx eslint .` and `npx eslint . --fix`
2. `npm run build`
3. Update the version number in `package.json`
4. `npm update` & commit result
5. `git tag`
6. `git push origin main --tags`
7. `npm publish`
