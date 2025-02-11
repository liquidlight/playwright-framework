import type { PlaywrightTestConfig } from '@playwright/test';
import { defineConfig } from '@playwright/test';
import { default as generateFrameworkConfig } from './generateFrameworkConfig.js';

export default function (
	// Specific devices if different to default
	inputDevices: string[] = [],

	configOverride: PlaywrightTestConfig = {}
): any {
	return defineConfig(
		generateFrameworkConfig(inputDevices, configOverride)
	);
}
