import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
	TestCase,
	TestError,
	TestResult,
} from '@playwright/test/reporter';

import { relative, sep } from 'path';

/**
 * CI reporter
 *
 * Prints one line per test once all its retries have finished, then a
 * summary and a single, de-duplicated error block for each failed test.
 *
 * When running in GitLab CI (GITLAB_CI is set), the full per-attempt detail is
 * wrapped in collapsible sections and attachments link to the job artifacts.
 */

const RULE = '='.repeat(72);

// Annotation types written by the framework fixtures (see fixtures.ts)
export const URL_ANNOTATIONS = ['goto', 'request', 'page-url'];

type Outcome = ReturnType<TestCase['outcome']>;

export interface Environment {
	gitlab: boolean;
	jobUrl?: string;
	projectUrl?: string;
	commitSha?: string;
	projectDir: string;
	// Where Playwright writes results; files here are uploaded as job artifacts
	outputDirs?: string[];
	color: boolean;
}

export function getEnvironment(env: NodeJS.ProcessEnv = process.env, isTTY = !!process.stdout.isTTY): Environment {
	const gitlab = !!env.GITLAB_CI;
	const forceColor = env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== 'false';

	return {
		gitlab,
		jobUrl: env.CI_JOB_URL,
		projectUrl: env.CI_PROJECT_URL,
		commitSha: env.CI_COMMIT_SHA,
		projectDir: env.CI_PROJECT_DIR || process.cwd(),
		color: !env.NO_COLOR && (forceColor || gitlab || isTTY),
	};
}

/**
 * Colours
 */
export function colorize(enabled: boolean) {
	const wrap = (code: number) => (text: string) => (enabled ? `\u001b[${code}m${text}\u001b[39m` : text);
	return {
		red: wrap(31),
		green: wrap(32),
		yellow: wrap(33),
		cyan: wrap(36),
		dim: (text: string) => (enabled ? `\u001b[2m${text}\u001b[22m` : text),
		bold: (text: string) => (enabled ? `\u001b[1m${text}\u001b[22m` : text),
	};
}

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001b\[[0-9;]*m/g;

export function stripAnsi(text: string): string {
	return text.replace(ANSI_REGEX, '');
}

/**
 * Formatting helpers
 */
export function formatDuration(ms: number): string {
	if (ms < 1000) {
		return `${Math.round(ms)}ms`;
	}

	if (ms < 60000) {
		return `${(ms / 1000).toFixed(1)}s`;
	}

	const minutes = Math.floor(ms / 60000);
	const seconds = Math.round((ms % 60000) / 1000);
	return `${minutes}m ${seconds}s`;
}

export function outcomeIcon(outcome: Outcome): string {
	switch (outcome) {
		case 'expected':
			return '✅';
		case 'unexpected':
			return '❌';
		case 'flaky':
			return '⚠️ ';
		default:
			return '⏭️ ';
	}
}

// The describe blocks and test name, e.g. "Smoke test › Homepage"
export function testTitle(test: Pick<TestCase, 'titlePath'>): string {
	// titlePath is ['', project, file, ...describes, title]
	return test.titlePath().slice(3).filter(Boolean).join(' › ');
}

export function projectName(test: Pick<TestCase, 'parent'>): string {
	let suite: Suite | undefined = test.parent;
	while (suite) {
		const project = suite.project();
		if (project) {
			return project.name;
		}
		suite = suite.parent;
	}
	return '';
}

export function relativePath(file: string, projectDir: string): string {
	const path = relative(projectDir, file);
	return (path && !path.startsWith('..')) ? path.split(sep).join('/') : file;
}

/**
 * Turn an attachment path into a link in GitLab.
 * Results (screenshots, traces) link to the job artifacts: images open in the
 * artifact browser, anything else downloads. Files committed to the repository,
 * such as visual comparison baselines, link to the file at the tested commit.
 */
export function attachmentLink(path: string, environment: Environment): string {
	const file = relativePath(path, environment.projectDir);
	if (!environment.gitlab || file === path) {
		return file;
	}

	const encoded = file.split('/').map(encodeURIComponent).join('/');
	const isResult = !environment.outputDirs?.length
		|| environment.outputDirs.some(dir => !relative(dir, path).startsWith('..'));

	if (isResult && environment.jobUrl) {
		const mode = /\.(png|jpe?g|gif|webp|md|txt)$/i.test(file) ? 'file' : 'raw';
		return `${environment.jobUrl.replace(/\/$/, '')}/artifacts/${mode}/${encoded}`;
	}

	if (!isResult && environment.projectUrl && environment.commitSha) {
		return `${environment.projectUrl.replace(/\/$/, '')}/-/blob/${environment.commitSha}/${encoded}`;
	}

	return file;
}

// "Screenshot", or "Expected", "Actual" and "Diff" for visual comparison images
export function attachmentLabel(name: string): string {
	const base = name.replace(/\.[a-z]+$/i, '');
	const comparison = base.match(/-(expected|actual|diff)$/);
	const label = comparison?.[1] ?? base;
	return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

/**
 * Every URL the test visited or requested, in order, de-duplicated.
 * The final page URL is only included when it differs from the last goto.
 */
export function collectUrls(results: Pick<TestResult, 'annotations'>[], fallback: TestCase['annotations'] = []): string[] {
	const annotations = results.flatMap(result => result.annotations ?? []);
	const source = annotations.length ? annotations : fallback;

	const urls: string[] = [];
	let lastGoto: string | undefined;

	for (const annotation of source) {
		if (!annotation.description || !URL_ANNOTATIONS.includes(annotation.type)) {
			continue;
		}

		let url = annotation.description;
		if (annotation.type === 'goto') {
			lastGoto = url;
		}

		if (annotation.type === 'page-url') {
			if (url === lastGoto) {
				continue;
			}
			url = `→ ended on ${url}`;
		}

		if (!urls.includes(url)) {
			urls.push(url);
		}
	}

	return urls;
}

export interface ErrorGroup {
	errors: TestError[];
	attempts: number[];
}

// The errors of each failed attempt, with attempts that failed the same way merged
export function distinctErrors(results: Pick<TestResult, 'errors' | 'retry'>[]): ErrorGroup[] {
	const groups = new Map<string, ErrorGroup>();

	for (const result of results) {
		if (!result.errors.length) {
			continue;
		}

		const key = result.errors.map(error => stripAnsi(error.message ?? error.value ?? '').trim()).join('\n');
		const group = groups.get(key);
		if (group) {
			group.attempts.push(result.retry + 1);
			// Keep the latest attempt's errors
			group.errors = result.errors;
		} else {
			groups.set(key, { errors: result.errors, attempts: [result.retry + 1] });
		}
	}

	return [...groups.values()];
}

type AttachmentLike = TestResult['attachments'][number];

// Images (screenshots and visual comparison expected/actual/diff), videos and traces
function isUsefulAttachment(attachment: AttachmentLike): attachment is AttachmentLike & { path: string } {
	return !!attachment.path && (attachment.contentType.startsWith('image/') || ['video', 'trace'].includes(attachment.name));
}

// Useful attachments, taken from the latest attempt that has each one
export function collectAttachments(results: Pick<TestResult, 'attachments'>[]): { name: string, path: string }[] {
	const found = new Map<string, { name: string, path: string }[]>();

	for (const result of results) {
		const byName = new Map<string, { name: string, path: string }[]>();
		for (const attachment of result.attachments.filter(isUsefulAttachment)) {
			byName.set(attachment.name, [...(byName.get(attachment.name) ?? []), { name: attachment.name, path: attachment.path }]);
		}

		for (const [name, list] of byName) {
			found.set(name, list);
		}
	}

	// Images first, then the video and trace
	const order = (name: string) => ['video', 'trace'].indexOf(name);
	return [...found.entries()]
		.sort(([a], [b]) => order(a) - order(b))
		.flatMap(([, list]) => list);
}

function errorLines(errors: TestError[] = []): string[] {
	return errors
		.flatMap(error => stripAnsi(error.message ?? error.value ?? '').split('\n'))
		.map(line => line.trim())
		.filter(Boolean);
}

// The first line of an error that is not in the error shown in full, so similar errors can be told apart
export function differingLine(lines: string[], shownLines: string[]): string {
	return lines.find(line => !shownLines.includes(line)) ?? lines[0] ?? '';
}

function indent(text: string, spaces: number): string {
	const pad = ' '.repeat(spaces);
	return text.split('\n').map(line => (line.trim() ? pad + line : '')).join('\n');
}

let sectionCount = 0;

// A GitLab collapsible log section. Elsewhere, the header and body are printed as they are.
export function section(header: string, body: string, environment: Environment): string {
	if (!environment.gitlab) {
		return `${header}\n${body}`;
	}

	const name = `playwright_detail_${++sectionCount}`;
	const time = Math.floor(Date.now() / 1000);
	return [
		`\u001b[0Ksection_start:${time}:${name}[collapsed=true]\r\u001b[0K${header}`,
		body,
		`\u001b[0Ksection_end:${time}:${name}\r\u001b[0K`,
	].join('\n');
}

export function formatError(error: TestError, environment: Environment): string {
	const c = colorize(environment.color);
	const lines: string[] = [];

	const message = (error.message ?? error.value ?? 'Unknown error').trim();
	lines.push(message);

	if (error.snippet) {
		lines.push('', error.snippet);
	}

	if (error.location) {
		lines.push(c.dim(`at ${relativePath(error.location.file, environment.projectDir)}:${error.location.line}:${error.location.column}`));
	}

	// Playwright colours its messages itself, so remove them when colour is off
	const text = lines.join('\n');
	return environment.color ? text : stripAnsi(text);
}

export function formatFailure(index: number, test: TestCase, environment: Environment): string {
	const c = colorize(environment.color);
	const results = test.results;
	const last = results[results.length - 1];
	const errors = distinctErrors(results);
	const lines: string[] = [];

	const location = `${relativePath(test.location.file, environment.projectDir)}:${test.location.line}`;
	const project = projectName(test);
	lines.push(c.red(c.bold(`${index}) ${location} › ${testTitle(test)}`)) + (project ? c.dim(`  [${project}]`) : ''));

	const urls = collectUrls(results, test.annotations);
	urls.forEach((url, i) => {
		lines.push(indent(`${i === 0 ? 'URL:' : '    '} ${url}`, 3));
	});

	const shown = errors[errors.length - 1];
	if (shown) {
		for (const error of shown.errors) {
			lines.push('', indent(formatError(error, environment), 3));
		}
	} else if (last?.status === 'timedOut') {
		lines.push(indent(`Timed out after ${formatDuration(last.duration)}`, 3));
	}

	const attachments = collectAttachments(results);
	if (attachments.length) {
		lines.push('');
		for (const attachment of attachments) {
			const label = `${attachmentLabel(attachment.name)}:`.padEnd(11);
			lines.push(indent(`${label} ${attachmentLink(attachment.path, environment)}`, 3));
		}
	}

	if (results.length > 1) {
		lines.push('');
		if (errors.length === 1) {
			lines.push(indent(c.dim(`Same error on all ${results.length} attempts`), 3));
		} else if (errors.length > 1) {
			lines.push(indent(c.yellow(`Attempts failed with ${errors.length} different errors:`), 3));
			const shownLines = errorLines(shown?.errors);
			for (const group of errors.slice(0, -1)) {
				const label = `Attempt ${group.attempts.join(', ')}:`;
				lines.push(indent(`${label} ${differingLine(errorLines(group.errors), shownLines)}`, 5));
			}
		}
	}

	// Full output of the attempts that failed differently from the one shown above, folded away in GitLab
	if (environment.gitlab && errors.length > 1) {
		const detail = errors.slice(0, -1).map(group => {
			const body = group.errors.map(error => formatError(error, environment)).join('\n\n');
			return `Attempt ${group.attempts.join(', ')}\n${indent(body, 2)}`;
		}).join('\n\n');

		lines.push('', section(indent(c.dim('Full output of the other attempts'), 3), indent(detail, 3), environment));
	}

	return lines.join('\n');
}

export function formatTestLine(test: TestCase, environment: Environment): string {
	const c = colorize(environment.color);
	const outcome = test.outcome();
	const results = test.results;
	const last = results[results.length - 1];
	const title = testTitle(test);

	let suffix = '';
	if (outcome === 'unexpected') {
		suffix = c.red(results.length > 1 ? `failed ${results.length}/${results.length} attempts` : 'failed');
	} else if (outcome === 'flaky') {
		suffix = c.yellow(`passed on retry ${last ? last.retry : ''}`);
	} else if (outcome === 'skipped') {
		suffix = c.dim(results.length ? 'skipped' : 'did not run');
	} else if (last) {
		suffix = c.dim(formatDuration(last.duration));
	}

	return `  ${outcomeIcon(outcome)} ${title}  ${suffix}`;
}

export function formatSummary(tests: TestCase[], durationMs: number, environment: Environment): string {
	const c = colorize(environment.color);
	const count = (outcome: Outcome) => tests.filter(test => test.outcome() === outcome && test.results.length).length;
	const notRun = tests.filter(test => !test.results.length).length;

	const parts = [
		[count('unexpected'), (n: number) => c.red(`❌ ${n} failed`)],
		[count('flaky'), (n: number) => c.yellow(`⚠️  ${n} flaky`)],
		[count('expected'), (n: number) => c.green(`✅ ${n} passed`)],
		[count('skipped'), (n: number) => c.dim(`⏭️  ${n} skipped`)],
		[notRun, (n: number) => c.dim(`⏭️  ${n} did not run`)],
	] as const;

	return parts
		.filter(([n]) => n > 0)
		.map(([n, format]) => format(n))
		.concat(c.dim(formatDuration(durationMs)))
		.join(' · ');
}

/**
 * The reporter
 */
export default class CiReporter implements Reporter {
	private suite?: Suite;
	private environment: Environment;
	private startTime = Date.now();
	private globalErrors = 0;
	private printed = new Set<TestCase>();
	private lastHeading?: string;

	constructor() {
		this.environment = getEnvironment();
	}

	printsToStdio(): boolean {
		return true;
	}

	onBegin(config: FullConfig, suite: Suite): void {
		this.suite = suite;
		this.environment.outputDirs = config.projects.map(project => project.outputDir);
		this.startTime = Date.now();

		const total = suite.allTests().length;
		const workers = config.workers;
		console.log(`\nRunning ${total} test${total === 1 ? '' : 's'} using ${workers} worker${workers === 1 ? '' : 's'}\n`);
	}

	// The file and project a test's line is printed under
	private heading(test: TestCase): string {
		const c = colorize(this.environment.color);
		const project = projectName(test);
		return `${relativePath(test.location.file, this.environment.projectDir)}${project ? `  ${c.dim(`[${project}]`)}` : ''}`;
	}

	private printTestLine(test: TestCase): void {
		const heading = this.heading(test);
		if (heading !== this.lastHeading) {
			console.log(colorize(this.environment.color).bold(heading));
			this.lastHeading = heading;
		}

		console.log(formatTestLine(test, this.environment));
		this.printed.add(test);
	}

	// Print each test as soon as it has no retries left, so long runs show progress
	onTestEnd(test: TestCase, result: TestResult): void {
		if (test.outcome() === 'unexpected' && result.retry < test.retries) {
			return;
		}

		this.printTestLine(test);
	}

	onError(error: TestError): void {
		const c = colorize(this.environment.color);
		this.globalErrors++;
		console.log(c.red(c.bold('Error outside of a test:')));
		console.log(indent(formatError(error, this.environment), 2));
		console.log('');
	}

	onEnd(result: FullResult): void {
		const c = colorize(this.environment.color);
		const tests = this.suite?.allTests() ?? [];

		// `playwright test --list` runs nothing, so print the test names
		if (result.status === 'passed' && tests.length && tests.every(test => !test.results.length)) {
			for (const test of tests) {
				const project = projectName(test);
				console.log(`  ${relativePath(test.location.file, this.environment.projectDir)}:${test.location.line} › ${testTitle(test)}${project ? c.dim(`  [${project}]`) : ''}`);
			}
			return;
		}

		// Tests that never finished, e.g. after a beforeAll failure or an interrupted run
		for (const test of tests) {
			if (!this.printed.has(test)) {
				this.printTestLine(test);
			}
		}

		const failed = tests.filter(test => test.outcome() === 'unexpected');

		console.log(RULE);
		console.log(formatSummary(tests, result.duration ?? Date.now() - this.startTime, this.environment));

		if (result.status === 'interrupted') {
			console.log(c.yellow('Run was interrupted before all tests finished'));
		} else if (result.status === 'timedout') {
			console.log(c.red('Run hit the global timeout before all tests finished'));
		} else if (result.status === 'failed' && !failed.length && this.globalErrors) {
			console.log(c.red(`${this.globalErrors} error${this.globalErrors === 1 ? '' : 's'} outside of tests (see above)`));
		}

		console.log(RULE);

		failed.forEach((test, i) => {
			console.log(formatFailure(i + 1, test, this.environment));
			console.log('');
		});
	}
}
