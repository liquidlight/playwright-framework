import type { Project, PlaywrightTestConfig } from '@playwright/test';
import { defaultDevices, convertDeviceToPlaywrightProject } from './utils.js';
import { config } from './base.js';

export default function (
	// Specific devices if different to default
	inputDevices: string[] = defaultDevices,

	configOverride: PlaywrightTestConfig = {}
): any {
	// Collate PLaywright projects
	const projects: Project[] = [];

	// Send the first device & search for unit, spec & test files
	projects.push(convertDeviceToPlaywrightProject(inputDevices.shift()));
	// Create a site for each remaining device & only search for `.test` files
	for (const device of (inputDevices ?? [])) {
		projects.push(convertDeviceToPlaywrightProject(device, { testsToFind: 'test' }));
	}

	config.projects = projects;

	return {
		...config,
		...configOverride
	}
}
