---
title: Visual Regression Testing
nav_order: 1
parent: Example Tests
---

# Visual Regression Testing

Generally saved as `visual-regression.test.ts`.

If using the [npm scripts](./../installation.html#packagejson-scripts), run `npm test:update` to generate new screenshots. You can then run `npm test vr` to compare.

```ts
import { test, expect } from '@liquidlight/playwright-framework';

test.describe('Visual Regression', { tag: ['@snapshot', '@vr'] }, () => {

	const pages = {
		'Homepage': '/',
		'About › About Us': '/about/about-us/'
	};

	const screenshotProperties = {
		fullPage: true,
		maxDiffPixelRatio: 0.2
	}

	// Loop through the pages and take a screenshot for each
	Object.entries(pages).forEach(([testName, url]) => {
		test(testName, async({page}) => {
			test.info().annotations.push({type: 'path', description: test.info().project.metadata.url + url});
			await page.goto(url);
			await expect(page).toHaveScreenshot(screenshotProperties);
		});
	});

	test('Homepage › Print CSS', async ({ page }) => {
		await page.emulateMedia({ media: 'print' });

		await page.goto('/');
		await expect(page).toHaveScreenshot(screenshotProperties);
	});
});
```
