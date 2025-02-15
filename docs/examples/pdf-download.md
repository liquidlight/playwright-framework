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
    await page.goto('/s');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();

    const download = await downloadPromise;
    await download.path();
});
```
