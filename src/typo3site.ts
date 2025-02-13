import { parse } from 'yaml'
import fs from 'fs';

export default function (siteName: string): Array<{ [key: string]: string }> {
	const yaml = parse(fs.readFileSync(`./config/sites/${siteName}/config.yaml`, 'utf8'));

	const project: any = {
		production: yaml.base
	}

	for (const variant of yaml.baseVariants) {
		const matches = variant.condition.match(/"(.*?)"/);
		let env = (matches ? matches[1] : false);

		if (env) {
			env = env.split('/');
			env = env.length > 1 ? env[1] : env[0];
			env = env.toLowerCase();
			project[env as keyof typeof project.envs] = variant.base
		}
	}

	return project;
}
