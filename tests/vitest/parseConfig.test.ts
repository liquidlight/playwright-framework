import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { parse } from 'yaml';
import typo3site from '../../src/typo3site.js';

// Mock `fs.readFileSync` and `yaml.parse`
vi.mock('node:fs')

vi.mock('yaml', () => ({
	parse: vi.fn()
}));

// Sample YAML mock data
const mockYamlData = {
	base: 'https://example.com',
	baseVariants: [
		{
			condition: 'ENV == "staging"',
			base: 'https://staging.example.com'
		},
		{
			condition: 'ENV == "development"',
			base: 'https://dev.example.com'
		}
	]
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe('typo3site', () => {
	test('should correctly parse a valid YAML config', () => {
		// Mock file read and YAML parse response
		(fs.readFileSync as vi.Mock).mockReturnValue('mock yaml content');
		(parse as vi.Mock).mockReturnValue(mockYamlData);

		const result = typo3site('test-site');

		expect(fs.readFileSync).toHaveBeenCalledWith('./config/sites/test-site/config.yaml', 'utf8');
		expect(parse).toHaveBeenCalledWith('mock yaml content');

		expect(result).toEqual({
			production: 'https://example.com',
			staging: 'https://staging.example.com',
			development: 'https://dev.example.com'
		});
	});

	test('should return only production URL if there are no variants', () => {
		(fs.readFileSync as vi.Mock).mockReturnValue('mock yaml content');
		(parse as vi.Mock).mockReturnValue({ base: 'https://example.com', baseVariants: [] });

		const result = typo3site('test-site');

		expect(result).toEqual({
			production: 'https://example.com'
		});
	});

	test('should handle an invalid or missing condition field gracefully', () => {
		(fs.readFileSync as vi.Mock).mockReturnValue('mock yaml content');
		(parse as vi.Mock).mockReturnValue({
			base: 'https://example.com',
			baseVariants: [{ condition: '', base: 'https://invalid.example.com' }]
		});

		const result = typo3site('test-site');

		expect(result).toEqual({
			production: 'https://example.com'
		});
	});

	test('should throw an error if the YAML file is missing', () => {
		(fs.readFileSync as vi.Mock).mockImplementation(() => {
			throw new Error('File not found');
		});

		expect(() => typo3site('nonexistent-site')).toThrow('File not found');
	});
});
