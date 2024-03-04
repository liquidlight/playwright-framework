import { Project } from '@playwright/test';
import { defaultDevices, convertSiteToPlaywrightProject } from './utils';
import type { Site } from './types';

module.exports = (
	// Object of sites
	sites: Site[],

	// Specific devices if different to default
	inputDevices: string[] = defaultDevices
) => {
	// Collate PLaywright projects
	const projects: Project[] = [];

	// Loop through defined sites
	for (const site of sites) {
		let devices = inputDevices;
		if(site.devices) {
			devices = site.devices;
			delete site.devices;
		}

		if(devices.length > 0) {
			// Create a site for each default device
			for (const device of devices) {
				projects.push(convertSiteToPlaywrightProject(site, device));
			}
		} else {
			projects.push(convertSiteToPlaywrightProject(site));
		}
	}

	// Return Playwright configuration
	return {
		/* Run tests in files in parallel */
		fullyParallel: true,
		/* Fail the build on CI if you accidentally left test.only in the source code. */
		forbidOnly: !!process.env.CI,
		/* Retry on CI only */
		retries: process.env.CI ? 2 : 0,
		/* Opt out of parallel tests on CI. */
		workers: process.env.CI ? 1 : undefined,
		/* Reporter to use. See https://playwright.dev/docs/test-reporters */
		reporter: [
			['list', { printSteps: true }],
			['html']
		],
		/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
		use: {
			/* Base URL to use in actions like `await page.goto('/')`. */
			// baseURL: 'http://127.0.0.1:3000',

			/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
			trace: 'on-first-retry',
			screenshot: 'only-on-failure'
		},

		/* Configure projects for major browsers */
		projects
	};
}
