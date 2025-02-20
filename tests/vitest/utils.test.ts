import { describe, test, expect, vi, beforeEach } from 'vitest';
import { defaultDevices, getEnv } from '../../src/utils.js';

describe('Default Devices', () => {
	test('Default devices are as expected', () => {
		expect(defaultDevices).toStrictEqual(['Desktop Edge', 'Desktop Safari', 'iPhone 14']);
	});
});

describe('Get Environment', () => {
	beforeEach(() => {
		vi.resetModules(); // Ensures the environment variable doesn't persist across tests
	});

	test('getEnv returns the correct environment', () => {
		process.env.PLAYWRIGHT_ENV = 'local';
		expect(getEnv()).toStrictEqual('local');

		process.env.PLAYWRIGHT_ENV = 'staging';
		expect(getEnv()).toStrictEqual('staging');
	});
});
