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
    test(`Homepage`, async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveScreenshot({
            fullPage: true
        });
    });
    test(`About`, async ({ page }) => {
        await page.goto('/about/');

        await expect(page).toHaveScreenshot({
            fullPage: true
        });
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
