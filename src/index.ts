/**
 * ====
 * Exports
 * ====
 */
// Playwright exports to simplify includes
export { defineConfig, test, expect } from '@playwright/test';

// The main framework
export { default as framework } from './framework.js';

// The main framework
export { default as defineFrameworkConfig } from './configure.js';

// TYPO3 configuration
export { default as typo3Config } from './typo3Config.js';

// TYPO3 configuration
export { default as testbed } from './testbed.js';

// Utils
export * from './utils.js';
