import { devices } from '@playwright/test';
import type { Project, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';
import type { Site } from './types.js';
interface Config {
	testsToFind: string;
}

// What default devices should we test on
export const defaultDevices: string[] = ['Desktop Edge', 'Desktop Safari', 'iPhone 14'];

// Convert a Site object to a Playwright Project
export function convertSiteToPlaywrightProject(site: Site, device: string = '', config?: Config): Project
{
	// Set the env
	let env = getEnv();

	// Create a new item (spread operator to create a new object rather than returning a reference)
	const item: Project<PlaywrightTestOptions, PlaywrightWorkerOptions> = site.project ?
		{...site.project } :
		{...site }
	;

	// Give it a concatenated name
	item.name = `${item.name ?? site.label}${device ? ' - ' + device : ''}`;

	item.metadata = {
		label: (item.name ?? site.label),
		device: device ?? '',
	}

	// Add the device & the original
	item.use = {
		...(device ? devices[device] : {}),
		...item.use ?? {}
	};

	// If the tes file name is not specified, use the default
	let testsToFind = 'unit|spec|test';
	if (config && Object.prototype.hasOwnProperty.call(config, 'testsToFind')) {
		testsToFind = config.testsToFind;
	}

	item.testMatch = '**/*.@(' + testsToFind + ').?(c|m)[jt]s?(x)';

	// Check we have a domain with that env, otherwise fallback to production
	if (site.envs) {
		if(site.envs[env as keyof typeof site.envs] === undefined) {
			env = 'production'
		}

		item.use.baseURL = site.envs[env as keyof typeof site.envs];

		// Metadata
		item.metadata.env = env;
		item.metadata.url = item.use.baseURL;
	}

	return item;
}

export function convertDeviceToPlaywrightProject(device: string = '', config?: Config): Project {
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

export function copyInstance(original: object) {
	const copied = Object.assign(
		Object.create(
			Object.getPrototypeOf(original)
		),
		original
	);
	return copied;
}


export const getEnv = () => process.env.npm_config_env || process.env.PLAYWRIGHT_ENV || 'local';

export const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;

export function getHostForEnv(hosts: any, path: string): string {
	if (!URL.canParse(path)) return path;

	const url = new URL(path);
	const base = swapEnvHostname(hosts, url.origin);
	return base + url.pathname + url.search + url.hash;
}

export function swapEnvHostname(hosts: any[], origin: string): string {
	const normOrigin = normalizeUrl(origin);
	const env = getEnv();

	for (const host of hosts) {
		// Explicitly tell TypeScript that the values are strings
		const urls = new Set<string>(Object.values(host).map(url => normalizeUrl(url as string)));
		if (urls.has(normOrigin)) {
			// Find the matching key without looping through all entries
			for (const key in host) {
				if (normalizeUrl(host[key] as string) === normOrigin) {
					return key === env ? origin : (host[env] as string) || origin;
				}
			}
		}
	}
	return origin;
}



export function slugify(str: string): string
{
	return String(str)
		.normalize('NFKD') // split accented characters into their base characters and diacritical marks
		.replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
		.trim() // trim leading or trailing whitespace
		.toLowerCase() // convert to lowercase
		.replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
		.replace(/\s+/g, '-') // replace spaces with hyphens
		.replace(/-+/g, '-'); // remove consecutive hyphens
}
