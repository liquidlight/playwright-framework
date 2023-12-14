
import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';

/**
 * Creates a test for a KE Search Page
 *
 * @param page - The Page object for the test
 * @param searchWords - The words to be entered into the search box to get results
 * @param path - The URL path to get to the search page
 *
 * @returns void
 */
export async function keSearchReturnsResults(page: Page, searchWords: string = '', path: string = '/search/', )
{
	await page.goto(path);

	await page.locator('#ke_search_sword').fill(searchWords);
	await page.getByRole('button', { name: 'Find' }).click();
	await expect(page.locator('.result').first()).toBeVisible();
}
