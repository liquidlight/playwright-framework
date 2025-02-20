import {test} from './../src/index.js';

test('Hosts get substituted when using goto', async ({page, hosts}) => {

	const host = hosts[0];

	for (const env of Object.keys(host)) {
		for (const target of Object.keys(host)) {
			process.env.PLAYWRIGHT_ENV = env;
			await page.goto(host[target]);
			await expect(page.url()).toBe(host[env]);
		}
	}
});


test.use({ baseURL: 'https://www.mikestreety.co.uk'});

test('Hosts get substituted when using `use` and baseURL', async ({ page }) => {
	process.env.PLAYWRIGHT_ENV = 'local';

	await page.goto('./sitemap.xml');
	await expect(page.url()).toBe('https://www.liquidlight.co.uk/sitemap.xml');
});
