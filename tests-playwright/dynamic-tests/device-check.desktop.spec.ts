import {expect, test} from '../../src/index.js';

test('Device check: Desktop | Spec', async ({ }, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(false);
	expect(testInfo.project.name).toBe('Desktop Edge');
});
