import {test, expect} from './../../../src/index';

test('Device check: Mobile | Test', async ({ }, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(true);
	expect(['iPhone 15', 'Pixel 5']).toContain(testInfo.project.name);
});
