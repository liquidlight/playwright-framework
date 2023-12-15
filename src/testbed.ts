import { devices, Project } from '@playwright/test';
import { slugify } from './utils';

/**
 * Create a testbed platform for quick tests
 */
export default function (
	browsers: string[] = [
		'Desktop Chrome',
		'Desktop Firefox',
		'Desktop Safari',
		'Desktop Edge',
		'Pixel 5',
		'iPhone 12'
	],
	folder: string = 'testbed'
): Project[]
{
	let projects: Project[] = [];

	for (let browser of browsers) {
		// What folders will it use tests from?
		let folders = [
				// A slugified version of it's name (e.g. iphone-12)
				slugify(browser),
				// The browser type (e.g. webkit)
				devices[browser].defaultBrowserType,
				// A mobile or desktop folder
				(devices[browser].isMobile ? 'mobile' : 'desktop'),
			]
			// Add an escaped slash at the end
			.map(f => f + '\/')
			// Join them with a pipe
			.join('|')
		;

		projects.push({
			name: browser,
			use: {
				...devices[browser]
			},
			// Anything in tests
			testDir: './' + folder,
			// Match anything top level or anything in a type folder
			testMatch: new RegExp(folder + '\/(' + folders + ')?[^\/]+.(spec|test).(c|m)?[jt]s(x)?')
		})
	}

	return projects;
}
