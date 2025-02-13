import type { FrameworkTest } from "./types.js";

import { test as playwrightTest } from "@playwright/test";
import { matchHostToEnv } from "./utils.js";

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
				matchedHost = matchHostToEnv(hosts, url);

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

	// Overwrite the page
	// Overwrite the page
	page: async ({ page, hosts }, use) => {
		// Create a reference of the original goto
		const goto = page.goto.bind(page);

		// Overwrite the goto function
		page.goto = async (url: string, options?) => {
			// Define URL with correct host
			url = (matchHostToEnv(hosts, url) ?? url)

			// Carry on with the original page.goto
			await goto(url, options);
		}

		// Use the page
		await use(page);
	},
});
