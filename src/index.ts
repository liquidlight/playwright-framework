/**
 * ====
 * Exports
 * ====
 */
// Playwright exports to simplify includes
export { defineConfig, test, expect } from '@playwright/test';

// Returns a playwright defineConfig with the framework sprinkled over the top
export { default as defineFrameworkConfig } from './defineFrameworkConfig.js';

// The framework base config
export { default as base } from './base.js';

// The main framework
export { default as framework } from './framework.js';

// A base configuration with some sensible defaults
export { default as generateFrameworkConfig } from './generateFrameworkConfig.js';

// TYPO3 configuration
export { default as typo3Config } from './typo3Config.js';

// TYPO3 site
export { default as t3site } from './t3site.js';

// TYPO3 configuration
export { default as testbed } from './testbed.js';

// Utils
export * from './utils.js';
