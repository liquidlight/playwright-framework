import { devices, Project, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';
import type { Site } from './types';

// What default devices should we test on
export const defaultDevices: string[] = ['Desktop Edge', 'iPhone 14'];

// Convert a Site object to a Playwright Project
export function convertSiteToPlaywrightProject(site: Site, device: string = ''): Project
{
	// Set the env
	let env = process.env.PLAYWRIGHT_ENV ?? 'local';

	// Create a new item (spread operator to create a new object rather than returning a reference)
	const item: Project<PlaywrightTestOptions, PlaywrightWorkerOptions> = site.project ? {...site.project } : {...site };

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
