import type { Project } from '@playwright/test';
import type {
	PlainObject,
	ProjectConfig
} from './types.js';
import { devices } from '@playwright/test';

/**
 * Consts
 */

// What default devices should we test on
export const defaultDevices: string[] = ['Desktop Edge', 'Desktop Safari', 'iPhone 14'];

// Get the current environment
export const getEnv = () =>
	process.env.npm_config_env ||
	process.env.PLAYWRIGHT_ENV ||
	process.env.ENV ||
	'local'
;

export const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

/**
 * Functions
 */
export function generateDynamicTestProjects(projects: string[]): Project[]
{
	const firstMobile: string | undefined = projects.find(name => devices[name].isMobile);
	const firstDesktop: string | undefined = projects.find(name => !devices[name].isMobile);

	return projects.map((device, index) => convertDeviceToPlaywrightProject(
		device,
		{
			firstDevice: (index === 0),
			firstMobile: (device === firstMobile),
			firstDesktop: (device === firstDesktop),
		}
	));
}

// Convert a single device name to a Playwright project
export function convertDeviceToPlaywrightProject(title: string = '', config?: ProjectConfig): Project {
	const deviceConfig = devices[title];

	if (!deviceConfig) {
		throw new Error(`Device configuration not found: ${title}`);
	}

	// Create an item for the device
	const firstDeviceTest = 'unit|spec',
		item: any = {
			name: title,
			use: deviceConfig,
			testMatch: []
		},
		testMatch = [
			// Every device should match `filename.test.ts`
			'test'
		]
	;

	// If the first device, match filename.unit.ts & filename.spec.ts
	testMatch.push(config?.firstDevice ? firstDeviceTest : '');

	// If the device is mobile, add `filename.mobile.test.ts
	testMatch.push(
			deviceConfig.isMobile ?
			'mobile\\.(test' + (config?.firstMobile ? `|${firstDeviceTest}` : '') + ')'
			: ''
	);

	// If the device is mobile, add `filename.mobile.test.ts
	testMatch.push(
			!deviceConfig.isMobile ?
			'desktop\\.(test' + (config?.firstMobile ? `|${firstDeviceTest}` : '') + ')'
			: ''
	);

	item.testMatch = testMatch
		.filter((match: string) => match)
		.map(match => new RegExp(`^[^.]+\\.(${match})\\.[cm]?[jt]sx?$`));
	;

	// Return the item
	return item;
}

// Swap a host based on environment
export function matchUrlHostToEnv(hosts: any, path: string): string {
	// Is the path a valid URL
	if (!URL.canParse(path)) {
		return path;
	}

	// Parse the URL
	const url = new URL(path);

	// Get the new origin
	const base = matchHostnameToEnv(hosts, normalizeUrl(url.origin));

	// Reconstruct the URL with the new base
	return normalizeUrl(base) + url.pathname + url.search + url.hash;
}

// Swap the host based on environment
export function matchHostnameToEnv(hosts: any[], origin: string): string {
	// Get the current environment
	const env = getEnv();

	// Loop through hosts
	for (const host of hosts) {
		// Get all the URLs from the host
		const urls = new Set<string>(Object.values(host).map(url => normalizeUrl(url as string)));
		// Is our origin in that set?
		if (urls.has(origin)) {
			// Find the matching key without looping through all entries
			for (const key in host) {
				if (normalizeUrl(host[key]) === origin) {
					return key === env ? origin : host[env] || origin;
				}
			}
		}
	}
	return origin;
}

// Allow deep merging of objects
export function deepMerge<T extends PlainObject>(target: T, ...sources: PlainObject[]): T {
	if (!sources.length) return target;
	const source = sources.shift() as PlainObject;

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				deepMerge(target[key] as PlainObject, source[key] as PlainObject);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return deepMerge(target, ...sources);
}

// Detect if a variable is an object
export function isObject(item: any): item is PlainObject {
	return (item && typeof item === 'object' && !Array.isArray(item));
}
