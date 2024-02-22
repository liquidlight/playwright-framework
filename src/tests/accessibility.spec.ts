import type { TestInfo } from 'playwright/types/test';
import type { Page } from 'playwright-core';
import type { AxeResults } from 'axe-core';

import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { createHtmlReport } from 'axe-html-reporter';

/**
 * Test the accessibility of a page, generate a HTML report and attach
 *
 * @param page - The Page object for the test
 * @param testInfo - The testInfo object
 * @param results - AxeBuilder Results if tested outside the method
 *
 * @returns void
 */
export async function assertPageIsAccessible(page: Page, testInfo: TestInfo, results: AxeResults) {

	// Generate reults if not passed in
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
}
