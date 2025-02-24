/**
 * ====
 * Exports
 * ====
 */
// Types
export type * from './types.js';

// Playwright exports to simplify includes
export * from '@playwright/test';

// Modified Playwright test
export { test } from './fixtures.js';

// The base configuration
export { baseConfig } from './baseConfig.js';

// The generated config
export { default as configuration } from './configuration.js';

// TYPO3 site
export { default as typo3site } from './typo3site.js';

// Utils
export { defaultDevices, getEnv, matchHostnameToEnv } from './utils.js';
