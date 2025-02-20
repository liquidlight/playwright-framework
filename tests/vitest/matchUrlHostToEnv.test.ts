import { describe, test, expect, beforeEach } from 'vitest';
import { matchHostnameToEnv, matchUrlHostToEnv, normalizeUrl } from '../../src/utils.js';

// Mock hosts data
const hosts = [
	{
		development: 'https://dev.example.com',
		staging: 'https://staging.example.com',
		production: 'https://example.com',
	},
	{
		development: 'https://dev.api.example.com',
		staging: 'https://staging.api.example.com',
		production: 'https://api.example.com',
	}
];

describe('matchHostnameToEnv', () => {
	beforeEach(() => {
		process.env.PLAYWRIGHT_ENV = ''; // Reset environment before each test
	});

	test('should return the same origin if not found in hosts', () => {
		process.env.PLAYWRIGHT_ENV = 'staging';
		const origin = 'https://unknown.com';
		const result = matchHostnameToEnv(hosts, origin);
		expect(result).toBe(origin);
	});

	test('should return the correct environment-specific host', () => {
		process.env.PLAYWRIGHT_ENV = 'staging';
		const origin = 'https://dev.example.com';
		const result = matchHostnameToEnv(hosts, normalizeUrl(origin));
		expect(result).toBe('https://staging.example.com');
	});

	test('should return the original host if environment does not match', () => {
		process.env.PLAYWRIGHT_ENV = 'production';
		const origin = 'https://staging.api.example.com';
		const result = matchHostnameToEnv(hosts, normalizeUrl(origin));
		expect(result).toBe('https://api.example.com');
	});

	test('should return the original host if env key is not present', () => {
		process.env.PLAYWRIGHT_ENV = 'test'; // Non-existent env
		const origin = 'https://dev.example.com';
		const result = matchHostnameToEnv(hosts, normalizeUrl(origin));
		expect(result).toBe(origin);
	});
});

describe('matchUrlHostToEnv', () => {
	beforeEach(() => {
		process.env.PLAYWRIGHT_ENV = ''; // Reset environment before each test
	});

	test('should return the same path if it is not a valid URL', () => {
		const path = '/relative/path';
		const result = matchUrlHostToEnv(hosts, path);
		expect(result).toBe(path);
	});

	test('should replace the hostname with the environment-specific hostname', () => {
		process.env.PLAYWRIGHT_ENV = 'staging';
		const path = 'https://dev.example.com/some/path?query=1#fragment';
		const result = matchUrlHostToEnv(hosts, path);
		expect(result).toBe('https://staging.example.com/some/path?query=1#fragment');
	});

	test('should return the original URL if no matching hostname is found', () => {
		process.env.PLAYWRIGHT_ENV = 'staging';
		const path = 'https://unknown.com/some/path';
		const result = matchUrlHostToEnv(hosts, path);
		expect(result).toBe(path);
	});

	test('should return the correct production URL', () => {
		process.env.PLAYWRIGHT_ENV = 'production';
		const path = 'https://dev.api.example.com/api/test';
		const result = matchUrlHostToEnv(hosts, path);
		expect(result).toBe('https://api.example.com/api/test');
	});
});
