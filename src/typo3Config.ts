import { parse } from 'yaml'
import fs from 'fs';
import type { Site } from './types.js';

export default function (siteName: string, testDir?: string, config?: object, inputDevices?: string[]): Site {
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
