import {test, expect} from './../../src/index';

test('Device check: Test', async ({ }, testInfo) => {
	expect(true).toBe(true);
	expect(['Desktop Edge', 'Desktop Safari', 'iPhone 14', 'Pixel 5']).toContain(testInfo.project.name);
});
