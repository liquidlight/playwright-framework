import {test} from './../src/index.js';

test('Device check: Spec', async ({ }, testInfo) => {
	console.log('Name:' + testInfo.project.name);
	console.log('Browser:' + testInfo.project.use.defaultBrowserType);
});
