import type { Project } from '@playwright/test';
import type { Hosts, FrameworkTestConfig } from './types.js';
import { defaultDevices, convertDeviceToPlaywrightProject, deepMerge } from './utils.js';
import { config } from './base.js';

export default function (
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

	config.projects = projects;

	if(hosts.length > 1) {
		if(!config.use) {
			config.use = {};
		}

		config.use.hosts = hosts;
	}

	return deepMerge({}, config, configOverride);
}
