import type { Project } from '@playwright/test';
import type {
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
	// Set hosts if you want
	hosts = [] as Hosts,
	// Specific devices if different to default
	inputDevices: string[] = defaultDevices,

	configOverride: FrameworkTestConfig = {}
): any {
	// Collate PLaywright projects
	const projects: Project[] = [];

	// Redefine in case an empty array is passed in
	const devices = inputDevices.length ? inputDevices : defaultDevices

	// Send the first device & search for unit, spec & test files
	projects.push(convertDeviceToPlaywrightProject(devices.shift()));
	// Create a site for each remaining device & only search for `.test` files
	for (const device of (devices ?? [])) {
		projects.push(convertDeviceToPlaywrightProject(device, { testsToFind: 'test' }));
	}

	baseConfig.projects = projects;

	if (hosts.length > 1) {
		if (!baseConfig.use) {
			baseConfig.use = {};
		}

		baseConfig.use.hosts = hosts;
	}

	return deepMerge({}, baseConfig, configOverride);
}
