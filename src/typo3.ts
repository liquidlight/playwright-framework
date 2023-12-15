import { parse } from 'yaml'
import fs from 'fs';
import { globSync } from 'glob';
import type { Site } from './types';

export default function(): Site[] {
	const projects: Site[] = [];

	const files = globSync('./config/sites/*/config.yaml', {});
	for (const path of files) {
		const yaml = parse(fs.readFileSync(path, 'utf8'))

		const project: Site = {
			label: yaml.websiteTitle,
			envs: {
				production: yaml.base
			},
			project: {
				testDir: `./${path.replace('config', 'app').replace('config.yaml', '')}`
			}
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

		projects.push(project);
	}

	return projects;
}
