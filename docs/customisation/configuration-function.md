---
title: "configuration function"
nav_order: 1
parent: Customisation
---

# `configuration()` function

The `configuration` function is the heart of the framework and enables several features throughout your tests.

In it's simplest form it generates the base config & projects for [dynamic tests](./dynamic-tests), however you will most likely want to pass in hosts, maybe override the devices or customise the config.

The function outputs the configuration object, so you can assign to a variable and manipulate if required.

## Options

The `configuration` function takes 2 parameters as objects - the first being for configuring the framework and the second being a direct override for the base config.

```ts
configuration(
	options: ConfigurationOptions = {
		// Set hosts if you want
		hosts: [] as Hosts,
		// Specific devices if different to default
		inputDevices: [],
	},

	configOverride: FrameworkTestConfig = {}
):
```

## Examples

#### Using the base configuration

This will give you the base configuration with Monocart, dynamic tests & sensible defaults.

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(configuration());
```

#### Adding `hosts`

By adding hosts you can take advantage of the dynamic hosts functionality.

More details in the [dynamic hosts documentation](./dynamic-hosts).

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration({
		hosts: [{
			production: 'https://www.liquidlight.co.uk',
			local: 'https://liquidlight.ddev.site'
		}]
	})
);
```

#### Overwriting devices

You can specify your own devices to test with and still benefit from the dynamic tests.

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration({
		devices: ['Blackberry PlayBook']
	})
);
```

#### Overwriting configuration

Lastly you can specify config to overwrite as the second parameter. This will be directly merged with the [baseConfg](https://github.com/liquidlight/playwright-framework/blob/main/src/baseConfig.ts).

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

export default defineConfig(
	configuration(
		{},
		{
			reporter: 'list'
		}
	)
);
```

Alternatively, you can assign the config to a variable and manipulate it there:

```ts
import { defineConfig, configuration } from '@liquidlight/playwright-framework';

const config = configuration();

config.reporter = [['html', { outputFolder: 'my-report' }]],

export default defineConfig(config);
```
