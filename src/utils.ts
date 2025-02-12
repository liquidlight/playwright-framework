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
export const getEnv = () => process.env.npm_config_env || process.env.PLAYWRIGHT_ENV || 'local';

export const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

/**
 * Functions
 */

// Convert a single device name to a Playwright project
export function convertDeviceToPlaywrightProject(device: string = '', config?: ProjectConfig): Project {
	// Create an item for the device
	const item: any = {
		name: device,
		use: devices[device]
	}

	// If the tes file name is not specified, use the default
	let testsToFind = 'unit|spec|test';
	if (config && Object.prototype.hasOwnProperty.call(config, 'testsToFind')) {
		testsToFind = config.testsToFind;
	}

	item.testMatch = '**/*.@(' + testsToFind + ').?(c|m)[jt]s?(x)';

	return item;
}

// Copy an object
export function copyInstance(original: object) {
	const copied = Object.assign(
		Object.create(
			Object.getPrototypeOf(original)
		),
		original
	);
	return copied;
}

// Swap a host based on environment
export function getHostForEnv(hosts: any, path: string): string {
	// Is the path a valid URL
	if (!URL.canParse(path)) {
		return path;
	}

	// Parse the URL
	const url = new URL(path);

	// Get the new origin
	const base = swapEnvHostname(hosts, normalizeUrl(url.origin));

	// Reconstruct the URL with the new base
	return base + url.pathname + url.search + url.hash;
}

// Swap the host based on environment
export function swapEnvHostname(hosts: any[], origin: string): string {
	// Get the current environment
	const env = getEnv();

	// Loop through hosts
	for (const host of hosts) {
		// Get all the URLs from the host
		const urls = new Set<string>(Object.values(host).map(url => normalizeUrl(url as string)));
		// Is our origin in that set?
		if (urls.has(origin)) {
			// Return the new URL or, if it doesn't exist, the original
			return host[env] as string || origin;
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
