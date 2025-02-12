import type { Site } from './types.js';
import type { ProjectConfig } from './../types.js';
import type { Project, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';

import { getEnv } from './../utils.js';
import { parse } from 'yaml'
import fs from 'fs';
import { devices } from '@playwright/test';

export function deprecationNotice()
{
	if(process.env.PWF_DEPRECATION_V1 !== 'true') {
		console.warn('⚠️ Legacy functionality detected');
		console.warn('The configuration is using deprectaed functionality which will be removed in the next version.');
		console.warn('Please follow the migration guide to upgrade');
		console.warn('[INSERT URL]');

		process.env.PWF_DEPRECATION_V1 = 'true';
	}
}

export function typo3Config(siteName: string, testDir?: string, config?: object, inputDevices?: string[]): Site {

	deprecationNotice();

	const yaml = parse(fs.readFileSync(`./config/sites/${siteName}/config.yaml`, 'utf8'));

	const project: Site = {
		label: yaml.websiteTitle,
		envs: {
			production: yaml.base
		}
	}

	if (testDir) {
		project.project = {
			testDir,
		}
	}

	if(config) {
		project.project = {
			...project.project,
			...config
		}
	}

	if(inputDevices) {
		project.devices = inputDevices
	}

	for (const variant of yaml.baseVariants) {
		const matches = variant.condition.match(/"(.*?)"/);
		let env = (matches ? matches[1] : false);

		if (env) {
			env = env.split('/');
			env = env.length > 1 ? env[1] : env[0];
			env = env.toLowerCase();
			project.envs[env as keyof typeof project.envs] = variant.base
		}
	}

	return project;
}

// Convert a Site object to a Playwright Project
export function convertSiteToPlaywrightProject(site: Site, device: string = '', config?: ProjectConfig): Project
{
	deprecationNotice();

	// Set the env
	let env = getEnv();

	// Create a new item (spread operator to create a new object rather than returning a reference)
	const item: Project<PlaywrightTestOptions, PlaywrightWorkerOptions> = site.project ?
		{...site.project } :
		{...site }
	;

	// Give it a concatenated name
	item.name = `${item.name ?? site.label}${device ? ' - ' + device : ''}`;

	item.metadata = {
		label: (item.name ?? site.label),
		device: device ?? '',
	}

	// Add the device & the original
	item.use = {
		...(device ? devices[device] : {}),
		...item.use ?? {}
	};

	// If the tes file name is not specified, use the default
	let testsToFind = 'unit|spec|test';
	if (config && Object.prototype.hasOwnProperty.call(config, 'testsToFind')) {
		testsToFind = config.testsToFind;
	}

	item.testMatch = '**/*.@(' + testsToFind + ').?(c|m)[jt]s?(x)';

	// Check we have a domain with that env, otherwise fallback to production
	if (site.envs) {
		if(site.envs[env as keyof typeof site.envs] === undefined) {
			env = 'production'
		}

		item.use.baseURL = site.envs[env as keyof typeof site.envs];

		// Metadata
		item.metadata.env = env;
		item.metadata.url = item.use.baseURL;
	}

	return item;
}


export function slugify(str: string): string
{
	return String(str)
		.normalize('NFKD') // split accented characters into their base characters and diacritical marks
		.replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
		.trim() // trim leading or trailing whitespace
		.toLowerCase() // convert to lowercase
		.replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
		.replace(/\s+/g, '-') // replace spaces with hyphens
		.replace(/-+/g, '-'); // remove consecutive hyphens
}
