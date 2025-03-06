import type { PlaywrightTestConfig } from '@playwright/test';

// A default "Object" for deep merge
export type PlainObject = Record<string, any>;

// A single Site in a host
export type HostSite = {
	[key: string]: string;
}

// How should the hosts be formatted
export type Hosts = HostSite[];

// Define additional parameters
export type FrameworkTest = {
	hosts: Hosts;
}

// The first object of the configuration function
export interface ConfigurationOptions {
	// Set hosts
	hosts?: Hosts;
	// Specific devices if different to default
	inputDevices?: string[];
}

// Extend the existing PlaywrightTestConfig
export interface FrameworkTestConfig extends PlaywrightTestConfig {
	use?: PlaywrightTestConfig['use'] & {
		hosts?: Hosts;
	};
}

// The additional configuration for a project
export interface ProjectConfig {
	firstDevice: boolean;
	firstMobile: boolean;
	firstDesktop: boolean;
}
