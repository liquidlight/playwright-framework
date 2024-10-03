import type { Site } from './types.js';
import type { Project } from '@playwright/test';
import { defaultDevices, convertSiteToPlaywrightProject } from './utils.js';
import { execSync } from 'child_process';

export default function(
	// Object of sites
	sites: Site[],

	// Specific devices if different to default
	inputDevices: string[] = defaultDevices
): any {
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
	return {
		/* Run tests in files in parallel */
		fullyParallel: true,
		/* Fail the build on CI if you accidentally left test.only in the source code. */
		forbidOnly: !!process.env.CI,

		quiet: !!process.env.CI,
		/* Retry on CI only */
		retries: process.env.CI ? 2 : 0,
		/* Opt out of parallel tests on CI. */
		workers: process.env.CI ? 1 : undefined,

		/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
		use: {
			/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
			trace: 'on-first-retry',
			screenshot: 'only-on-failure'
		},

		/* Configure projects for major browsers */
		projects,

		/* Reporter to use. See https://playwright.dev/docs/test-reporters */
		reporter: (
			process.env.CI ?
				[
					['line'],
					[
						'junit',
						{
							outputFile: './test-results/playwright-report.xml'
						}
					]
				] :
				[
					[
						'list',
						{
							printSteps: true
						}
					],
					[
						'monocart-reporter',
						{
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

							columns: (defaultColumns: any) => {
								// add `device` column after `duration` column
								const index = defaultColumns.findIndex((column: any) => column.id === 'duration');
								defaultColumns.splice(
									index,
									0,
									{
										id: 'label',
										name: 'Label',
										width: 150,
										formatter: (v: string) => v ?? ''
									},
									{
										id: 'env',
										name: 'Environment',
										width: 150,
										formatter: (v: string) => (v.charAt(0).toUpperCase() + v.slice(1)) ?? ''
									},
									{
										id: 'device',
										name: 'Device',
										width: 150,
										formatter: (v: string) => v ?? ''
									}
								);
								defaultColumns.push({
									id: 'description',
									name: 'Description',
									markdown: true,
									searchable: true
								});
							},

							visitor: (data: any, pwData: any) => {
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

							onEnd: async (reportData: any, helper: any) => {
								const hasFailed = helper.find((item: any) => item.type === 'case' && item.caseType === 'failed');
								if (hasFailed) {
									console.log('There are some of the tests failed, open report ...');
									execSync(`npx monocart show-report ${reportData.htmlPath}`);
								}
							}
						}
					]
				]
		)
	};
}
