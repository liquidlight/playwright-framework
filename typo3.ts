import { parse } from 'yaml'
import fs from 'fs';
import { globSync } from 'glob';
import type { Site } from './types';

export function typo3SiteConfigurationLocator(): Site[] {
	let projects: Site[] = [];

	const files = globSync('./config/sites/*/config.yaml', {});
	for (let path of files) {
		let yaml = parse(fs.readFileSync(path, 'utf8'))

		let project: Site = {
			label: yaml.websiteTitle,
			envs: {
				production: yaml.base
			},
			project: {
				testDir: `./${path.replace('config', 'app').replace('config.yaml', '')}`
			}
		}

		for (let variant of yaml.baseVariants) {
			let matches = variant.condition.match(/"(.*?)"/);
			let env = (matches ? matches[1] : false);

			if (env) {
				env = env.split('/');
				env = env.length > 1 ? env[1] : env[0];
				project.envs[env.toLowerCase()] = variant.base
			}
		}

		projects.push(project);
	}

	return projects;
}
