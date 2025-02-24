import type { FrameworkTest } from "./types.js";

import { test as playwrightTest } from "@playwright/test";
import { matchUrlHostToEnv } from "./utils.js";
import path from 'node:path';

/**
 * Test
 *
 * Override the test to check/modify the host before proceeding
 */
export const test = playwrightTest.extend< FrameworkTest >({
	// Allow hosts to be passed through as a parameter in the pag
	hosts: [
		[],
		{ option: true }
	],

	context: async ({ browser, hosts }, use) => {
		const context = await browser.newContext();
		// Intercept all routes
		await context.route('**', async (route, request) => {
			// Get the URL we're going to
			const url = request.url(),
				// Run it against the match functions
				matchedHost = matchUrlHostToEnv(hosts, url);

			// If they are different
			if (url !== matchedHost) {
				// Redirect to the matched host
				await route.fulfill({
					status: 302,
					headers: {
						'location': matchedHost,
					},
					body: ''
				});

				return;
			}

			// Otherwise continue on our way
			await route.continue();
		});

		await use(context);
		await context.close();
	},

	// Overwrite & Extend the page
	page: async ({ page, hosts }, use) => {
		// Create a reference of the original goto
		const goto = page.goto.bind(page);

		// Overwrite the goto function
		page.goto = async (url: string, options?) => {
			// Define URL with correct host
			url = (matchUrlHostToEnv(hosts, url) ?? url)

			// Carry on with the original page.goto
			return goto(url, options);
		}

		/**
		 * Simpler jQuery inclusion
		 *
		 * version can be `latest`, `local` or a version number
		 */
		page.addJQuery = async (version: string = 'local') => {

			let jQueryPath;

			switch(version) {
				case 'local':
					jQueryPath = path.resolve('node_modules/jquery/dist/jquery.min.js');
					break;
				case 'latest':
					jQueryPath = 'https://www.unpkg.com/jquery/dist/jquery.min.js';
					break;
				default:
					jQueryPath = `https://www.unpkg.com/jquery@${version}/dist/jquery.min.js`;
					break;
			}

			return await page.addScriptTag({
				path: jQueryPath
			});
		}

		// Use the page
		await use(page);
	}
});
