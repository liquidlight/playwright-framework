import {test, expect} from './../../../src/index';

test('Device check: Desktop | Test', async ({}, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(false);
	expect(['Desktop Edge', 'Desktop Safari']).toContain(testInfo.project.name);
});
