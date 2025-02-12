import type { Project } from '@playwright/test';
import type { Site } from './types.js';
import { defaultDevices } from './../utils.js';
import { convertSiteToPlaywrightProject, deprecationNotice } from './utils.js';
import { baseConfig as config } from './../baseConfig.js';

export default function(
	// Object of sites
	sites: Site[],

	// Specific devices if different to default
	inputDevices: string[] = defaultDevices
): any {
	deprecationNotice();

	// Collate PLaywright projects
	const projects: Project[] = [];

	// Loop through defined sites
	for (const site of sites) {

		// Reset the devices
		let devices = inputDevices;

		// Override the devices if necessary
		if (site.devices) {
			devices = site.devices;
			delete site.devices;
		}

		// Do we have a number of devices?
		if (devices.length > 0) {
			// Send the first device & search for unit, spec & test files
			projects.push(convertSiteToPlaywrightProject(site, devices.shift()));
			// Create a site for each remaining device & only search for `.test` files
			for (const device of (devices ?? [])) {
				projects.push(convertSiteToPlaywrightProject(site, device, { testsToFind: 'test' }));
			}
		} else {
			projects.push(convertSiteToPlaywrightProject(site));
		}
	}

	// Return Playwright configuration
	config.projects = projects;
	return config;
}
