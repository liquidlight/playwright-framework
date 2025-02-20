import { defineConfig, configuration, defaultDevices } from './src/index.js';

export default defineConfig(
	configuration({
		hosts: [
			{
				local: 'https://www.liquidlight.co.uk/',
				production: 'https://www.mikestreety.co.uk/',
			},
			{
				local: 'https://dev.example.com',
				staging: 'https://staging.example.com',
				production: 'https://example.com',
			},
			{
				local: 'https://dev.api.example.com',
				staging: 'https://staging.api.example.com',
				production: 'https://api.example.com',
			}
		],
		inputDevices: [...defaultDevices, 'Pixel 5']
	}, {
		testDir: './tests/playwright',
		reporter: [['list'], ['html']]
	})
);
