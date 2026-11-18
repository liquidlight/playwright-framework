import { describe, test, expect } from 'vitest';
import {
	attachmentLabel,
	attachmentLink,
	collectAttachments,
	collectUrls,
	differingLine,
	distinctErrors,
	formatDuration,
	formatFailure,
	formatSummary,
	formatTestLine,
	getEnvironment,
	section,
	stripAnsi,
	type Environment,
} from '../../src/reporters/ci';

const projectDir = '/builds/project/site';

const plain: Environment = { gitlab: false, projectDir, color: false };
const gitlab: Environment = { gitlab: true, projectDir, color: false, jobUrl: 'https://gitlab.example/project/site/-/jobs/42' };

type Outcome = 'expected' | 'unexpected' | 'flaky' | 'skipped';

function result(retry: number, overrides: Record<string, any> = {}): any {
	return {
		retry,
		status: 'failed',
		duration: 1500,
		errors: [],
		attachments: [],
		annotations: [],
		...overrides,
	};
}

function error(message: string): any {
	return { message };
}

// A minimal TestCase with the fields the reporter reads
function testCase(outcome: Outcome, results: any[], annotations: any[] = []): any {
	return {
		titlePath: () => ['', 'Desktop Edge', 'smoke.spec.ts', 'Smoke test', 'Homepage'],
		parent: { project: () => ({ name: 'Desktop Edge' }), parent: undefined },
		location: { file: `${projectDir}/app/sites/site/smoke.spec.ts`, line: 6, column: 2 },
		outcome: () => outcome,
		results,
		annotations,
	};
}

describe('getEnvironment', () => {
	test('detects GitLab and turns colour on', () => {
		expect(getEnvironment({ GITLAB_CI: 'true', CI_JOB_URL: 'https://x/-/jobs/1', CI_PROJECT_URL: 'https://x', CI_COMMIT_SHA: 'abc', CI_PROJECT_DIR: '/builds/p' }, false))
			.toMatchObject({ gitlab: true, jobUrl: 'https://x/-/jobs/1', projectUrl: 'https://x', commitSha: 'abc', projectDir: '/builds/p', color: true });
	});

	test('NO_COLOR wins over GitLab and FORCE_COLOR', () => {
		expect(getEnvironment({ GITLAB_CI: 'true', FORCE_COLOR: '1', NO_COLOR: '1' }, true).color).toBe(false);
	});

	test('plain CI without a TTY has no colour', () => {
		expect(getEnvironment({ CI: 'true' }, false)).toMatchObject({ gitlab: false, color: false });
	});
});

describe('formatDuration', () => {
	test.each([
		[250, '250ms'],
		[1500, '1.5s'],
		[125000, '2m 5s'],
	])('%i ms is %s', (ms, expected) => {
		expect(formatDuration(ms)).toBe(expected);
	});
});

describe('attachmentLink', () => {
	test('is a relative path outside GitLab', () => {
		expect(attachmentLink(`${projectDir}/test-results/a/test-failed-1.png`, plain)).toBe('test-results/a/test-failed-1.png');
	});

	test('links images to the artifact browser in GitLab', () => {
		expect(attachmentLink(`${projectDir}/test-results/a/test-failed-1.png`, gitlab))
			.toBe('https://gitlab.example/project/site/-/jobs/42/artifacts/file/test-results/a/test-failed-1.png');
	});

	test('links other files as raw downloads in GitLab', () => {
		expect(attachmentLink(`${projectDir}/test-results/a/trace.zip`, gitlab))
			.toBe('https://gitlab.example/project/site/-/jobs/42/artifacts/raw/test-results/a/trace.zip');
	});

	test('keeps the path when GitLab has no job URL', () => {
		expect(attachmentLink(`${projectDir}/test-results/a/trace.zip`, { ...gitlab, jobUrl: undefined })).toBe('test-results/a/trace.zip');
	});

	test('links committed files, such as visual comparison baselines, to the repository', () => {
		const environment = { ...gitlab, projectUrl: 'https://gitlab.example/project/site', commitSha: 'abc123', outputDirs: [`${projectDir}/test-results`] };

		expect(attachmentLink(`${projectDir}/tests/home.spec.ts-snapshots/home-Desktop-Edge-linux.png`, environment))
			.toBe('https://gitlab.example/project/site/-/blob/abc123/tests/home.spec.ts-snapshots/home-Desktop-Edge-linux.png');
		expect(attachmentLink(`${projectDir}/test-results/home/home-diff.png`, environment))
			.toBe('https://gitlab.example/project/site/-/jobs/42/artifacts/file/test-results/home/home-diff.png');
	});

	test('keeps paths outside the project as they are', () => {
		expect(attachmentLink('/tmp/elsewhere/trace.zip', gitlab)).toBe('/tmp/elsewhere/trace.zip');
	});
});

describe('attachmentLabel', () => {
	test.each([
		['screenshot', 'Screenshot'],
		['trace', 'Trace'],
		['home-expected.png', 'Expected'],
		['home-actual.png', 'Actual'],
		['home-diff.png', 'Diff'],
	])('%s is %s', (name, label) => {
		expect(attachmentLabel(name)).toBe(label);
	});
});

describe('collectUrls', () => {
	test('lists each URL once, in order', () => {
		const urls = collectUrls([
			result(0, { annotations: [
				{ type: 'request', description: 'GET https://example.com/' },
				{ type: 'goto', description: 'https://example.com/page' },
			] }),
			result(1, { annotations: [
				{ type: 'request', description: 'GET https://example.com/' },
				{ type: 'goto', description: 'https://example.com/page' },
				{ type: 'other', description: 'ignored' },
			] }),
		]);

		expect(urls).toStrictEqual(['GET https://example.com/', 'https://example.com/page']);
	});

	test('shows where the page ended up only when it differs from the last goto', () => {
		expect(collectUrls([result(0, { annotations: [
			{ type: 'goto', description: 'https://example.com/a' },
			{ type: 'page-url', description: 'https://example.com/a' },
		] })])).toStrictEqual(['https://example.com/a']);

		expect(collectUrls([result(0, { annotations: [
			{ type: 'goto', description: 'https://example.com/old' },
			{ type: 'page-url', description: 'https://example.com/new' },
		] })])).toStrictEqual(['https://example.com/old', '→ ended on https://example.com/new']);
	});

	test('falls back to the test annotations', () => {
		expect(collectUrls([result(0)], [{ type: 'goto', description: 'https://example.com/' }])).toStrictEqual(['https://example.com/']);
	});
});

describe('distinctErrors', () => {
	test('merges identical errors across attempts, ignoring colour codes', () => {
		const groups = distinctErrors([
			result(0, { errors: [error('Expected: 200\nReceived: 307')] }),
			result(1, { errors: [error('\u001b[32mExpected: 200\u001b[39m\nReceived: 307')] }),
			result(2, { errors: [error('Expected: 200\nReceived: 307')] }),
		]);

		expect(groups).toHaveLength(1);
		expect(groups[0]?.attempts).toStrictEqual([1, 2, 3]);
	});

	test('treats every error of an attempt as one failure', () => {
		const groups = distinctErrors([
			result(0, { errors: [error('Soft failure'), error('Hard failure')] }),
			result(1, { errors: [error('Soft failure'), error('Hard failure')] }),
		]);

		expect(groups).toHaveLength(1);
		expect(groups[0]?.errors.map(e => e.message)).toStrictEqual(['Soft failure', 'Hard failure']);
	});

	test('keeps different errors apart', () => {
		const groups = distinctErrors([
			result(0, { errors: [error('Received: 0')] }),
			result(1, { errors: [error('Received: 1')] }),
		]);

		expect(groups.map(group => group.attempts)).toStrictEqual([[1], [2]]);
	});
});

describe('differingLine', () => {
	test('picks the first line not in the error shown in full', () => {
		expect(differingLine(['Error: toBe', 'Received: 0'], ['Error: toBe', 'Received: 2'])).toBe('Received: 0');
	});
});

describe('collectAttachments', () => {
	test('uses the latest attempt that has each attachment', () => {
		const attachments = collectAttachments([
			result(0, { attachments: [{ name: 'screenshot', contentType: 'image/png', path: '/r/0.png' }] }),
			result(1, { attachments: [{ name: 'screenshot', contentType: 'image/png', path: '/r/1.png' }, { name: 'trace', contentType: 'application/zip', path: '/r/1.zip' }] }),
			result(2, { attachments: [{ name: 'screenshot', contentType: 'image/png', path: '/r/2.png' }, { name: 'error-context', contentType: 'text/markdown', path: '/r/2.md' }] }),
		]);

		expect(attachments).toStrictEqual([
			{ name: 'screenshot', path: '/r/2.png' },
			{ name: 'trace', path: '/r/1.zip' },
		]);
	});
});

describe('collectAttachments for visual comparisons', () => {
	test('includes the expected, actual and diff images, ahead of the trace', () => {
		const attachments = collectAttachments([
			result(0, { attachments: [
				{ name: 'trace', contentType: 'application/zip', path: '/r/trace.zip' },
				{ name: 'home-expected.png', contentType: 'image/png', path: '/r/home-expected.png' },
				{ name: 'home-actual.png', contentType: 'image/png', path: '/r/home-actual.png' },
				{ name: 'home-diff.png', contentType: 'image/png', path: '/r/home-diff.png' },
				{ name: 'inline', contentType: 'image/png' },
			] }),
		]);

		expect(attachments.map(a => a.name)).toStrictEqual(['home-expected.png', 'home-actual.png', 'home-diff.png', 'trace']);
	});
});

describe('section', () => {
	test('wraps the body in a collapsed GitLab section', () => {
		const output = section('Header', 'Body', gitlab);
		// eslint-disable-next-line no-control-regex
		expect(output).toMatch(/^\u001b\[0Ksection_start:\d+:playwright_detail_\d+\[collapsed=true\]\r\u001b\[0KHeader\nBody\n\u001b\[0Ksection_end:\d+:playwright_detail_\d+\r\u001b\[0K$/);
	});

	test('prints the header and body as they are elsewhere', () => {
		expect(section('Header', 'Body', plain)).toBe('Header\nBody');
	});
});

describe('formatTestLine', () => {
	test.each([
		['expected', [result(0, { status: 'passed', duration: 400 })], '✅ Smoke test › Homepage  400ms'],
		['unexpected', [result(0), result(1), result(2)], '❌ Smoke test › Homepage  failed 3/3 attempts'],
		['unexpected', [result(0)], '❌ Smoke test › Homepage  failed'],
		['flaky', [result(0), result(1, { status: 'passed' })], '⚠️  Smoke test › Homepage  passed on retry 1'],
		['skipped', [result(0, { status: 'skipped' })], '⏭️  Smoke test › Homepage  skipped'],
		['skipped', [], '⏭️  Smoke test › Homepage  did not run'],
	] as [Outcome, any[], string][])('%s', (outcome, results, expected) => {
		expect(formatTestLine(testCase(outcome, results), plain).trim()).toBe(expected);
	});
});

describe('formatSummary', () => {
	test('counts each outcome and leaves out the empty ones', () => {
		const tests = [
			testCase('unexpected', [result(0)]),
			testCase('unexpected', [result(0)]),
			testCase('expected', [result(0, { status: 'passed' })]),
		];

		expect(formatSummary(tests, 46500, plain)).toBe('❌ 2 failed · ✅ 1 passed · 46.5s');
	});

	test('counts tests that never ran apart from skipped ones', () => {
		const tests = [
			testCase('skipped', [result(0, { status: 'skipped' })]),
			testCase('skipped', []),
			testCase('skipped', []),
		];

		expect(formatSummary(tests, 500, plain)).toBe('⏭️  1 skipped · ⏭️  2 did not run · 500ms');
	});
});

describe('formatFailure', () => {
	const failing = testCase('unexpected', [0, 1, 2].map(retry => result(retry, {
		errors: [{ message: 'Error: expect(received).toBe(expected)\n\nExpected: 200\nReceived: 307', snippet: '> 8 | expect(status).toBe(200);' }],
		attachments: retry === 1 ? [{ name: 'trace', contentType: 'application/zip', path: `${projectDir}/test-results/home-retry1/trace.zip` }] : [],
		annotations: [{ type: 'request', description: 'GET https://www.example.com/about/' }],
	})));

	test('prints the URL and error once for repeated failures', () => {
		const output = formatFailure(1, failing, plain);

		expect(output).toContain('1) app/sites/site/smoke.spec.ts:6 › Smoke test › Homepage  [Desktop Edge]');
		expect(output).toContain('URL: GET https://www.example.com/about/');
		expect(output.match(/Received: 307/g)).toHaveLength(1);
		expect(output).toContain('Trace:      test-results/home-retry1/trace.zip');
		expect(output).toContain('Same error on all 3 attempts');
		expect(output).not.toContain('section_start');
	});

	test('prints every error of the last attempt', () => {
		const soft = testCase('unexpected', [result(0, { errors: [error('Soft failure'), error('Hard failure')] })]);
		const output = formatFailure(1, soft, plain);

		expect(output).toContain('Soft failure');
		expect(output).toContain('Hard failure');
	});

	test('adds a collapsed section with every attempt in GitLab', () => {
		const output = stripAnsi(formatFailure(1, failing, gitlab));

		expect(output).toContain('artifacts/raw/test-results/home-retry1/trace.zip');
		expect(output).toContain('section_start:');
		expect(output).toContain('Attempt 3 (failed, 1.5s)');
		// Once in the summary and once for each attempt
		expect(output.match(/Received: 307/g)).toHaveLength(4);
	});
});
