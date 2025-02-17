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
export { defaultDevices, getEnv } from './utils.js';

/**
 * Legacy
 */
export { default as framework } from './_legacy/framework.js';

export { typo3Config } from './_legacy/utils.js';

// TYPO3 configuration
export { default as testbed } from './_legacy/testbed.js';
