import {test} from './../src/index.js';

test('Device check: Test', async ({ }, testInfo) => {
	console.log('Name:' + testInfo.project.name);
	console.log('Browser:' + testInfo.project.use.defaultBrowserType);
});
