import type { Site } from './types';
import { Project } from '@playwright/test';
import { defaultDevices, convertSiteToPlaywrightProject } from './utils';
import { execSync } from 'child_process';


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
			['monocart-reporter', {
				name: 'Playwright Report',
				outputFile: './test-results/report.html',
				customFieldsInComments: true,
				mermaid: {
					scriptSrc: 'https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js',
					// mermaid config: https://mermaid.js.org/config/schema-docs/config.html
					config: {
						startOnLoad: false
					}
				},

				tags: {
					vr: {
						style: {
							background: '#6e178f'
						},
						description: '"Visual Regression (VR)" is a technology that allows you to test the visual appearance of a web page'
					},
					snapshot: {
						style: {
							background: '#ff8f00'
						},
						description: 'Snapshots are tests which require saving of an initial state of a web page'
					},
				},

				columns: (defaultColumns) => {
					// add `device` column after `duration` column
					const index = defaultColumns.findIndex((column) => column.id === 'duration');
					defaultColumns.splice(
						index,
						0,
						{
							id: 'label',
							name: 'Label',
							width: 150,
							formatter: (v) => v ?? ''
						},
						{
							id: 'env',
							name: 'Environment',
							width: 150,
							formatter: (v) => (v.charAt(0).toUpperCase() + v.slice(1)) ?? ''
						},
						{
							id: 'device',
							name: 'Device',
							width: 150,
							formatter: (v) => v ?? ''
						}
					);
					defaultColumns.push({
						id: 'description',
						name: 'Description',
						markdown: true,
						searchable: true
					});
				},

				visitor: (data, pwData) => {
					// add `device` for project data
					if (data.type === 'suite' && data.suiteType === 'project') {
						data.label = data.metadata && data.metadata.label;
						data.env = data.metadata && data.metadata.env;
						data.device = data.metadata && data.metadata.device;
						return;
					}

					// add `device` for case data
					if (data.type === 'case') {
						let parent = pwData.parent;
						while (parent) {
							if (parent.project) {
								const project = parent.project();
								if (project.metadata) {
									data.label = project.metadata.label;
									data.env = project.metadata.env;
									data.device = project.metadata.device;
								}
								break;
							}
							parent = parent.parent;
						}
					}

				},

				onEnd: async (reportData, helper) => {
					const hasFailed = helper.find((item) => item.type === 'case' && item.caseType === 'failed');
					if (hasFailed) {
						console.log('There are some of the tests failed, open report ...');
						execSync(`npx monocart show-report ${reportData.htmlPath}`);
					}
				}
			}]
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
