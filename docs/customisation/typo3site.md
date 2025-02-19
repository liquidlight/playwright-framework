---
title: typo3site function
nav_order: 4
parent: Customisation
---

# `typo3site` function

The framework comes with a `typo3site` function to automatically build a `hosts` object based on `config/sites/[site]/config.yaml` in a TYPO3 site based on `baseVariants` specified with an `applicationContext`.

These can then be used with the [dynamic hosts](./dynamic-hosts) to test different environment URLs.

## Example

```ts
import {defineConfig, configuration, typo3site} from '@liquidlight/playwright-framework';

const config = configuration({
	hosts: [
		typo3site('site')
	]
});

export default defineConfig(config);
```

This would expect to find a `config/sites/site/config.yaml`

## More details

This looks for `baseVariants` in the config and builds up the correctly formatted `hosts` object from that.

If the `applicationContext` has a [Sub-part](https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/Configuration/ApplicationContext.html#sub-application-context), it will use that otherwise, it will use the full context.

For example:

- `Production` becomes `production`
- `Development` becomes `development`
- `Development/Dev1` becomes `dev1`
- `Testing/UnitTest` becomes `unitest`
