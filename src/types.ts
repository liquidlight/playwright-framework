import type { PlaywrightTestConfig } from '@playwright/test';

// What should a site look like?
export interface Site {
	// A nice name for the site
	label?: string;
	name?: string;

	// Should this site have specific devices
	devices?: string[]

	// What URLs does this site respond on
	envs: {
		production: string
		local?: string
		staging?: string
	}

	// A Playwright project
	project?: object
}

export type Hosts = Array<{ [key: string]: string }>;

export type PlainObject = Record<string, any>;

// Extend the existing PlaywrightTestConfig
export interface FrameworkTestConfig extends PlaywrightTestConfig {
	use?: PlaywrightTestConfig['use'] & {
		hosts?: Hosts;
	};
}
