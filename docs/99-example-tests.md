# Example Tests

Although this is covered in the Playwright documentation, it's useful to have some copy and paste examples

## Accessibility

```ts
import { test } from '@playwright/test';
import { assertPageIsAccessible } from '@liquidlight/playwright-framework/tests';

/**
 * Ensure our base page template is accessible
 */
test('"Tests" page is accessible', async ({ page }, testInfo) => {
    await page.goto('/tests');

    await assertPageIsAccessible(page, testInfo);
});
```

You can pass in your own results if you need to be more granualar

```ts
import { test } from '@playwright/test';
import { assertPageIsAccessible } from '@liquidlight/playwright-framework/tests';
import AxeBuilder from '@axe-core/playwright';

/**
 * Ensure our base page template is accessible
 */
test('"Tests" page is accessible', async ({ page }, testInfo) => {
    await page.goto('/tests');

    const accessibilityScanResults = await new AxeBuilder({ page })
        .disableRules(['duplicate-id'])
        .analyze();

    await assertPageIsAccessible(page, testInfo, accessibilityScanResults);
});
```

## Visual Regression Test

> [!NOTE]
> This will fail on the first time as it doesn't have a comparison

```ts
import { test, expect } from '@playwright/test';

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
        test(testName, async ({ page }) => {
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

## PDF Download

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
