import { test, expect } from '../../src/index';

test('page.goto records the URL it visited', async ({ page }) => {
	// Nothing listens on port 1, so the navigation fails without leaving the machine
	await page.goto('http://127.0.0.1:1/page').catch(() => {});

	expect(test.info().annotations).toContainEqual({ type: 'goto', description: 'http://127.0.0.1:1/page' });
});

test('request methods record the method and URL', async ({ request }) => {
	// Nothing listens on port 1, so the requests fail without leaving the machine
	await request.get('http://127.0.0.1:1/get').catch(() => {});
	await request.post('http://127.0.0.1:1/post').catch(() => {});
	await request.fetch('http://127.0.0.1:1/fetch', { method: 'delete' }).catch(() => {});

	expect(test.info().annotations).toEqual(expect.arrayContaining([
		{ type: 'request', description: 'GET http://127.0.0.1:1/get' },
		{ type: 'request', description: 'POST http://127.0.0.1:1/post' },
		{ type: 'request', description: 'DELETE http://127.0.0.1:1/fetch' },
	]));
});
