import type { Project } from '@playwright/test';
import type {
	ConfigurationOptions,
	FrameworkTestConfig,
	Hosts
} from './types.js';

import { baseConfig } from './baseConfig.js';
import {
	convertDeviceToPlaywrightProject,
	defaultDevices,
	deepMerge
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
	// Collate PLaywright projects
	const projects: Project[] = [];

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

	// Send the first device & search for unit, spec & test files
	projects.push(convertDeviceToPlaywrightProject(devices.shift()));
	// Create a site for each remaining device & only search for `.test` files
	for (const device of (devices ?? [])) {
		projects.push(convertDeviceToPlaywrightProject(device, { testsToFind: 'test' }));
	}

	baseConfig.projects = projects;

	if (options.hosts && options.hosts.length > 0) {
		if (!baseConfig.use) {
			baseConfig.use = {};
		}

		baseConfig.use.hosts = options.hosts;
	}

	return deepMerge({}, baseConfig, configOverride);
}
