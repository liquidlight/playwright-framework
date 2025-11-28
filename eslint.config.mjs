import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/*']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-empty-pattern': [
				'error', {
					allowObjectPatternsAsParameters: true,
				}
			],
			'@typescript-eslint/ban-ts-comment': [
				'error', {
					'ts-ignore': 'allow-with-description',
					'ts-expect-error': 'allow-with-description'
				}
			],
		}
	}
);
