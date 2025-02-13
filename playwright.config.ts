import { defineConfig, configuration } from './src/index.js';

export default defineConfig(
	configuration({
		hosts: [
			{
				local: 'https://www.liquidlight.co.uk/',
				production: 'https://www.mikestreety.co.uk/',
			}
		]
	}, {
		reporter: 'list'
	})
);
