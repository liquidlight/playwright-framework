import {test, expect} from './../../src/index.js';

test('Device check: Mobile | Spec', async ({ }, testInfo) => {
	expect(testInfo.project.use.isMobile).toBe(true);
	expect(testInfo.project.name).toBe('iPhone 14');
});
