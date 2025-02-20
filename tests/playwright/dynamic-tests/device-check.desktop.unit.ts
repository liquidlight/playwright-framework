import {expect, test} from './../../../src/index';

test('Device check: Desktop | Unit', async ({ }, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(false);
	expect(testInfo.project.name).toBe('Desktop Edge');
});
