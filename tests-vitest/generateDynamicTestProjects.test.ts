import { describe, test, expect } from 'vitest';
import { devices } from '../src/index';
import { generateDynamicTestProjects, convertDeviceToPlaywrightProject } from '../src/utils'; // Adjust path

describe('convertDeviceToPlaywrightProject', () => {
	test('should correctly convert a mobile device to a Playwright project', () => {
		const result = convertDeviceToPlaywrightProject('iPhone 12', {
			firstDevice: true,
			firstMobile: true,
			firstDesktop: false,
		});

		expect(result).toMatchObject({
			name: 'iPhone 12',
			use: devices['iPhone 12'],
			testMatch: [
				/^[^.]+\.(test|unit|spec)\.[cm]?[jt]sx?$/,
				/^[^.]+\.(mobile\.(test|unit|spec))\.[cm]?[jt]sx?$/
			]
		});
	});

	test('should correctly convert a desktop device to a Playwright project', () => {
		const result = convertDeviceToPlaywrightProject('Desktop Chrome', {
			firstDevice: false,
			firstMobile: false,
			firstDesktop: true,
		});

		expect(result).toMatchObject({
			name: 'Desktop Chrome',
			use: devices['Desktop Chrome'],
			testMatch: [
				/^[^.]+\.(test)\.[cm]?[jt]sx?$/,
				/^[^.]+\.(desktop\.(test|unit|spec))\.[cm]?[jt]sx?$/
			]
		});
	});

	test('should throw an error for an unknown device', () => {
		expect(() => convertDeviceToPlaywrightProject('Unknown Device')).toThrow(
			'Device configuration not found: Unknown Device'
		);
	});
});

describe('generateDynamicTestProjects', () => {
	test('should correctly generate Playwright projects for given devices', () => {
		const projects = ['iPhone 12', 'Pixel 5', 'Desktop Chrome', 'Desktop Firefox'];
		const result = generateDynamicTestProjects(projects);

		expect(result).toHaveLength(4);

		// First device should be 'iPhone 12'
		expect(result[0]).toMatchObject({
			name: 'iPhone 12',
			use: devices['iPhone 12'],
			testMatch: expect.arrayContaining([
				/^[^.]+\.(test|unit|spec)\.[cm]?[jt]sx?$/,
				/^[^.]+\.(mobile\.(test|unit|spec))\.[cm]?[jt]sx?$/
			])
		});

		// First desktop should be 'Desktop Chrome'
		expect(result.find(p => p.name === 'Desktop Chrome')).toMatchObject({
			name: 'Desktop Chrome',
			use: devices['Desktop Chrome'],
			testMatch: expect.arrayContaining([
				/^[^.]+\.(test)\.[cm]?[jt]sx?$/,
				/^[^.]+\.(desktop\.(test|unit|spec))\.[cm]?[jt]sx?$/
			])
		});
	});

	test('should handle an empty list of projects', () => {
		const result = generateDynamicTestProjects([]);
		expect(result).toEqual([]);
	});
});
