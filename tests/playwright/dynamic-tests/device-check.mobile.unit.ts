import {test, expect} from './../../src/index';

test('Device check: Mobile | Unit', async ({ }, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(true);
	expect(testInfo.project.name).toBe('iPhone 14');
});
