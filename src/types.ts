import type { PlaywrightTestConfig } from '@playwright/test';

// A default "Object" for deep merge
export type PlainObject = Record<string, any>;

// How should the hosts be formatted
export type Hosts = Array<{ [key: string]: string }>;

// Define additional parameters
export type FrameworkTest = {
	hosts: Hosts;
}

// Extend the existing PlaywrightTestConfig
export interface FrameworkTestConfig extends PlaywrightTestConfig {
	use?: PlaywrightTestConfig['use'] & {
		hosts?: Hosts;
	};
}

// The additional configuration for a project
export interface ProjectConfig {
	testsToFind: string;
}
