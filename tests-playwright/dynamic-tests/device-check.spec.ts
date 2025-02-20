import {test, expect} from './../../src/index.js';

test('Device check: Spec', async ({ }, testInfo) => {
	expect(true).toBe(true);
	expect(testInfo.project.name).toBe('Desktop Edge');

});
