---
title: Accessibility with AXE
nav_order: 4
parent: Example Tests
---

# Testing Accessibility with AXE

Detects whether a page or elements are accessible. More information in the [package README](https://playwright.dev/docs/accessibility-testing) or in the [Playwright docs](https://playwright.dev/docs/accessibility-testing).

`@axe-core/playwright` and `axe-html-reporter` are pre-installed.

```ts
import { test, expect } from '@liquidlight/playwright-framework';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';

/**
 * Ensure our base page template is accessible
 */
test('"Tests" page is accessible', async ({ page }, testInfo) => {
	await page.goto('/tests');

	// Generate results if not passed in
	if (!results) {
		results = await new AxeBuilder({ page }).analyze();
	}

	// Generate a HTML report
	createHtmlReport({
		results,
		options: {
			outputDir: 'playwright-report/data'
		},
	});

	// Attach the report
	await testInfo.attach('accessibility-scan-results', {
		path: 'playwright-report/data/accessibilityReport.html',
	});

	expect(results.violations).toEqual([]);
});
```
