import { defineConfig, configuration, defaultDevices } from './src/index.js';

export default defineConfig(
	configuration({
		hosts: [
			{
				local: 'https://www.liquidlight.co.uk/',
				production: 'https://www.mikestreety.co.uk/',
			}
		],
		inputDevices: [...defaultDevices, 'Pixel 5']
	}, {
		reporter: [['list'], ['html']]
	})
);
