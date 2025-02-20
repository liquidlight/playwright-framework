import { describe, test, expect } from 'vitest';
import { deepMerge } from '../../src/utils';

describe('deepMerge function', () => {
	test('should merge two flat objects correctly', () => {
		const target = { a: 1, b: 2 };
		const source = { b: 3, c: 4 };
		const result = deepMerge(target, source);

		expect(result).toEqual({ a: 1, b: 3, c: 4 });
	});

	test('should deeply merge nested objects', () => {
		const target = { a: { x: 1, y: 2 } };
		const source = { a: { y: 3, z: 4 } };
		const result = deepMerge(target, source);

		expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
	});

	test('should merge multiple objects sequentially', () => {
		const target = { a: 1 };
		const source1 = { b: 2 };
		const source2 = { c: 3 };
		const result = deepMerge(target, source1, source2);

		expect(result).toEqual({ a: 1, b: 2, c: 3 });
	});

	test('should not override existing deep structures unless explicitly set', () => {
		const target = { a: { x: 1 } };
		const source = { a: { y: 2 } };
		const result = deepMerge(target, source);

		expect(result).toEqual({ a: { x: 1, y: 2 } });
	});

	test('should handle merging when target has missing keys', () => {
		const target = {};
		const source = { a: 1, b: { x: 10, y: 20 } };
		const result = deepMerge(target, source);

		expect(result).toEqual({ a: 1, b: { x: 10, y: 20 } });
	});

	test('should handle arrays properly by replacing instead of merging', () => {
		const target = { a: [1, 2, 3] };
		const source = { a: [4, 5] };
		const result = deepMerge(target, source);

		expect(result).toEqual({ a: [4, 5] });
	});

	test('should return the same object if no sources are provided', () => {
		const target = { a: 1 };
		const result = deepMerge(target);

		expect(result).toEqual({ a: 1 });
	});

	test('should handle empty objects correctly', () => {
		const target = {};
		const source = {};
		const result = deepMerge(target, source);

		expect(result).toEqual({});
	});
});
