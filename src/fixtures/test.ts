import { test as base } from "@playwright/test";
import { copyInstance, getHostForEnv } from "./../utils.js";

type FrameworkOptions = {
	hosts: {
		[hostName: string]: {
			[environment: string]: string;
		};
	};
}

export const test = base.extend < FrameworkOptions >({
	hosts: [
		{},
		{ option: true }
	],

	page: async ({ page, hosts }, use) => {
		const frameworkPage = copyInstance(page);

		frameworkPage.goto = async function(url: string, options = {}) {
			await page.goto(getHostForEnv(hosts, url) ?? url, options);
		}
		await use(frameworkPage);
	},
});

export default test;
