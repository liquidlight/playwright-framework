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
