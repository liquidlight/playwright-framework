import { describe, test, expect, beforeAll } from 'vitest';
import { execSync, execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '../..');

/**
 * Load a compiled build in a separate Node process with source maps enabled,
 * which rewrites stack traces the same way Playwright does, and return the
 * resolved screenshot stylesheet path
 */
function resolveStylePath(script: string, inputType: 'module' | 'commonjs'): string {
	return execFileSync(
		process.execPath,
		['--enable-source-maps', `--input-type=${inputType}`, '-e', script],
		{ cwd: rootDir, encoding: 'utf8' }
	).trim();
}

beforeAll(() => {
	execSync('npm run build', { cwd: rootDir, stdio: 'ignore' });
}, 60000);

describe('baseConfig screenshot stylePath', () => {
	test('should resolve to the ESM dist folder', () => {
		const stylePath = resolveStylePath(
			"const { baseConfig } = await import('./dist/esm/baseConfig.js'); console.log(baseConfig.expect.toHaveScreenshot.stylePath);",
			'module'
		);

		expect(stylePath).toBe(resolve(rootDir, 'dist/esm/screenshot.css'));
		expect(existsSync(stylePath)).toBe(true);
	});

	test('should resolve to the CommonJS dist folder', () => {
		const stylePath = resolveStylePath(
			"const { baseConfig } = require('./dist/cjs/baseConfig.js'); console.log(baseConfig.expect.toHaveScreenshot.stylePath);",
			'commonjs'
		);

		expect(stylePath).toBe(resolve(rootDir, 'dist/cjs/screenshot.css'));
		expect(existsSync(stylePath)).toBe(true);
	});
});

describe('baseConfig CI reporter', () => {
	function resolveCiReporter(script: string, inputType: 'module' | 'commonjs'): string {
		return execFileSync(
			process.execPath,
			['--enable-source-maps', `--input-type=${inputType}`, '-e', script],
			{ cwd: rootDir, encoding: 'utf8', env: { ...process.env, CI: '1' } }
		).trim();
	}

	test('should resolve to the ESM dist folder and export a reporter class', () => {
		const output = resolveCiReporter(
			"const { baseConfig } = await import('./dist/esm/baseConfig.js'); const path = baseConfig.reporter[0][0]; const { default: Reporter } = await import(path); console.log(path, typeof Reporter);",
			'module'
		);

		expect(output).toBe(`${resolve(rootDir, 'dist/esm/reporters/ci.js')} function`);
	});

	test('should resolve to the CommonJS dist folder and export a reporter class', () => {
		const output = resolveCiReporter(
			"const { baseConfig } = require('./dist/cjs/baseConfig.js'); const path = baseConfig.reporter[0][0]; console.log(path, typeof require(path).default);",
			'commonjs'
		);

		expect(output).toBe(`${resolve(rootDir, 'dist/cjs/reporters/ci.js')} function`);
	});
});
