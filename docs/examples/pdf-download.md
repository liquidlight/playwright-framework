---
title: PDF Download
nav_order: 3
parent: Example Tests
---

# PDF Download

This relies on `download.path` which the [Playwright docs state](https://playwright.dev/docs/api/class-download#download-path):

> Returns path to the downloaded file for a successful download, or throws for a failed/canceled download.

```ts
import { test } from '@playwright/test';

test('Ensure standards translations are available', async ({ page }) => {
	await page.goto('/downloads');

	// Download the PDF
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('link', {name: 'Download'}).click()
	]);

	// The suggested filename should be download.pdf
	const filename = download.suggestedFilename();
	expect(filename.endsWith('.pdf')).toBeTruthy();

});
```
