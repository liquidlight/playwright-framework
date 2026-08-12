import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { viteAsset } from '../../src/utils';

// Mock `fs.readFileSync`
vi.mock('node:fs')

const mockManifest = {
	'app/sites/site_package/Resources/Private/JavaScript/core.js': {
		file: 'assets/core-abc123.js'
	}
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe('viteAsset', () => {
	test('should resolve the built asset path using the default base path', () => {
		(fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify(mockManifest));

		const result = viteAsset('app/sites/site_package/Resources/Private/JavaScript/core.js');

		expect(fs.readFileSync).toHaveBeenCalledWith(
			expect.stringContaining('html/_assets/vite/.vite/manifest.json'),
			'utf8'
		);
		expect(result).toBe('html/_assets/vite/assets/core-abc123.js');
	});

	test('should resolve the built asset path using a custom base path', () => {
		(fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify(mockManifest));

		const result = viteAsset('app/sites/site_package/Resources/Private/JavaScript/core.js', 'dist/vite');

		expect(fs.readFileSync).toHaveBeenCalledWith(
			expect.stringContaining('dist/vite/.vite/manifest.json'),
			'utf8'
		);
		expect(result).toBe('dist/vite/assets/core-abc123.js');
	});

	test('should throw an error if the entry is missing from the manifest', () => {
		(fs.readFileSync as vi.Mock).mockReturnValue(JSON.stringify(mockManifest));

		expect(() => viteAsset('missing/entry.js')).toThrow('viteAsset: no entry found in manifest for "missing/entry.js"');
	});
});
