# TYPO3

If you use TYPO3 as your CMS of choice, you can use an in-built helper to generate the URLs & site name.

> [!IMPORTANT]
> The helper assumes the following
> - You use `applicationContext` for different environments
> - Your site config uses full TLDs

Replace `[site]` with the folder name of the `config/sites/[site]/config.yaml` file/folder.

The second parameter is where the test files live (e.g. related `site_package` extension)

```js
import { defineConfig } from '@playwright/test';
import typo3Config from '@liquidlight/playwright-framework/typo3';

const config = require('@liquidlight/playwright-framework')([
    typo3Config('[site]', './path/to/files')
]);

module.exports = defineConfig(config);
```

If you wish, you can omit the second parameter and spread the result of the `typo3Config` function. E.g.

```typescript
{
    ...typo3Config('[site]'),
    project: {
        testDir: './path/to/files'
    }
}
```
