import { devices, Project } from '@playwright/test';
import type { Site } from './types';

// What default devices should we test on
export let defaultDevices: string[] = ['Desktop Edge', 'iPhone 14'];

// Convert a Site object to a Playwright Project
export function convertSiteToPlaywrightProject(site: Site, device: string, env: string = 'local'): Project
{
	return {
		// Merge in the project params
		...site.project,

		// Give it a concatenated name
		name: `${site.label} - ${env} [${device}]`,

		// Set the device and which URL to use as a base
		use: {
			baseURL: site.envs[env as keyof typeof site.envs],
			...devices[device]
		}
	};
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
