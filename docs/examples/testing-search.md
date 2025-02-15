---
title: Testing Search
nav_order: 2
parent: Example Tests
---

# Testing Search

Testing that a search can be conducted from the homepage and it returns results.

```ts
import { test, expect } from '@liquidlight/playwright-framework';

/**
 * Ensure our base page template is accessible
 */
test('Search page returns results', async ({ page }, testInfo) => {
	await page.goto('/');

	// ID of the search bar in the header
	await page.locator('#ke_search_sword').fill('company');

	// Click search
	await page.getByRole('button', { name: 'Find' }).click();

	// Are the results?
	await expect(page.locator('.result').first()).toBeVisible();
});
```
