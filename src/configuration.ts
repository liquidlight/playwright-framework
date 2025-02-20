import type {
	ConfigurationOptions,
	FrameworkTestConfig,
	Hosts
} from './types.js';

import { baseConfig } from './baseConfig.js';
import {
	defaultDevices,
	deepMerge,
	generateDynamicTestProjects
} from './utils.js';

export default function(
	options: ConfigurationOptions = {
		// Set hosts if you want
		hosts: [] as Hosts,
		// Specific devices if different to default
		inputDevices: [],
	},

	configOverride: FrameworkTestConfig = {}
): any {
	// Any devices in environment variable?
	const envDevices = process.env.PLAYWRIGHT_DEVICES ?
		process.env.PLAYWRIGHT_DEVICES.split(',').map(d => d.trim()) :
		null;

	const devices = envDevices ??
		(
			options.inputDevices?.length ?
			options.inputDevices :
			defaultDevices
		)
	;

	baseConfig.projects = generateDynamicTestProjects(devices);

	if (options.hosts && options.hosts.length > 0) {
		if (!baseConfig.use) {
			baseConfig.use = {};
		}

		baseConfig.use.hosts = options.hosts;
	}

	return deepMerge({}, baseConfig, configOverride);
}
