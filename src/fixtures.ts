import type { FrameworkTest } from "./types.js";

import { test as playwrightTest } from "@playwright/test";
import { copyInstance, getHostForEnv } from "./utils.js";

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

	// Overwrite the page
	page: async ({ page, hosts }, use) => {
		// Create a clone of the page object
		const frameworkPage = copyInstance(page);

		// Overwrite the goto function
		frameworkPage.goto = async function(url: string, options = {}) {
			// Define URL with correct host
			url = (getHostForEnv(hosts, url) ?? url)

			// Carry on with the original page.goto
			await page.goto(url, options);
		}

		// Use the `frameworkPage` object
		await use(frameworkPage);
	},
});
