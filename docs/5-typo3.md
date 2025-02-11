# TYPO3

If you use TYPO3 as your CMS of choice, you can use an in-built helper to generate the URLs & site name.

> [!IMPORTANT]
> The helper assumes the following
> - You use `applicationContext` for different environments
> - Your site config uses full TLDs

Update your `playwright.config.ts` file to be like the following

- Replace `[site]` with the folder name of the `config/sites/[site]/config.yaml` file/folder.
- The second parameter is where the test files live (e.g. related `site_package` extension)

```js
import { defineConfig } from '@playwright/test';
import { framework, typo3Config } from '@liquidlight/playwright-framework';

const config = framework([
	typo3Config('[site]', './path/to/files')
]);

export default defineConfig(config);
```

### Setting the testDir

If you wish, you can omit the second parameter and spread the result of the `typo3Config` function. E.g.

```typescript
{
    ...typo3Config('[site]'),
    project: {
        testDir: './path/to/files'
    }
}
```

### Re-using site config

If you have two extensions you wish to test with the same site config, you can re-use the configuration and update the `label`. For example:

```typescript
const config = framework([
	typo3Config('[site]', './app/sites/site_package'),
	{
		...typo3Config('[site]', './app/ext/extension'),
		label: 'Extension'
	}
]);
```

### Passing configuration

You may wish to pass extra options to the configuration, in which case, a third parameter can be used.

For example, the above can be achieved with:

```typescript
const config = framework([
	typo3Sites('[site]', './app/ext/extension', {label: 'Extension'}),
]);
```

### Devices

If you wish to override specific devices used for a TYPO3 project, the fourth parameter is an array of device strings.

For example, if you just want to use Firefox for a project, you can:

```typescript
const config = framework([
	typo3Sites('[site]', './app/ext/extension', {}, ['Firefox Desktop']),
]);
```
