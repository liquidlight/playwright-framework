# TYPO3

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
