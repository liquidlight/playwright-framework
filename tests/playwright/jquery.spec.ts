import { test, expect } from '../../src/index';


test.describe('Banner', () => {
	test.beforeEach(async ({ page }) => {
		// Set up an HTML fixture with two content sections.

		await page.setContent(`
			<div></div>
		`);

		await page.addJQuery();

		await page.addScriptTag({
			content: "$('div').addClass('playwright')"
		})
	});

	test('Does jquery load and work', async ({ page }) => {
		// The long title h1 should be in a container that gets the "hasLongTitle" class.
		const div = page.locator('div');
		await expect(div).toHaveClass(/playwright/);
	});
});
