/**
 * T031 + T032: SchemaInputAdapter interface + JsonSchemaAdapter tests (Gap 5).
 *
 * T031: JsonSchemaAdapter method contract tests.
 * T032: registerAdapter replaces the global default without throwing.
 */
import { describe, it, expect, afterEach } from 'vitest';
import {
	JsonSchemaAdapter,
	jsonSchemaAdapter,
} from '../../src/SchemaInput/JsonSchemaAdapter.js';
import {
	registerAdapter,
	getGlobalAdapter,
} from '../../src/SchemaInput/index.js';
import type { SchemaInputAdapter } from '../../src/SchemaInput/index.js';
import { buildV4 } from '../../src/ZodBuilder/index.js';
import type { Context } from '../../src/Types.js';

const ctx = (): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
});

describe('JsonSchemaAdapter — T031', () => {
	it('isValid({ type: "string" }) returns true', () => {
		expect(jsonSchemaAdapter.isValid({ type: 'string' })).toBe(true);
	});

	it('isValid("not-a-schema") returns false', () => {
		expect(jsonSchemaAdapter.isValid('not-a-schema')).toBe(false);
	});

	it('isValid(null) returns false', () => {
		expect(jsonSchemaAdapter.isValid(null)).toBe(false);
	});

	it('isValid({}) returns true (empty schema is valid)', () => {
		expect(jsonSchemaAdapter.isValid({})).toBe(true);
	});

	it('getRef({ $ref: "#/foo" }) returns "#/foo"', () => {
		expect(jsonSchemaAdapter.getRef({ $ref: '#/foo' })).toBe('#/foo');
	});

	it('getRef({ type: "string" }) returns undefined (no ref)', () => {
		expect(jsonSchemaAdapter.getRef({ type: 'string' })).toBeUndefined();
	});

	it('getMetadata extracts description and default', () => {
		const meta = jsonSchemaAdapter.getMetadata({
			description: 'x',
			default: 1,
		});
		expect(meta).toMatchObject({ description: 'x', default: 1 });
	});

	it('getMetadata extracts readOnly', () => {
		const meta = jsonSchemaAdapter.getMetadata({ readOnly: true });
		expect(meta.readOnly).toBe(true);
	});

	it('getMetadata returns empty object for schema with no metadata fields', () => {
		const meta = jsonSchemaAdapter.getMetadata({ type: 'string' });
		expect(meta.description).toBeUndefined();
		expect(meta.default).toBeUndefined();
	});

	it('selectParser returns a constructor for { type: "string" }', () => {
		const ctor = jsonSchemaAdapter.selectParser({ type: 'string' }, ctx());
		expect(ctor).toBeDefined();
		expect(typeof ctor).toBe('function');
	});

	it('selectParser returns undefined for unknown schema type', () => {
		const ctor = jsonSchemaAdapter.selectParser(
			{ type: 'x-unknown-zzz' },
			ctx(),
		);
		expect(ctor).toBeUndefined();
	});

	it('JsonSchemaAdapter can be instantiated directly', () => {
		const adapter = new JsonSchemaAdapter();
		expect(adapter).toBeInstanceOf(JsonSchemaAdapter);
		expect(adapter.isValid({ type: 'number' })).toBe(true);
	});
});

describe('registerAdapter — T032', () => {
	afterEach(() => {
		// Restore default adapter after each test
		registerAdapter(jsonSchemaAdapter);
	});

	it('registerAdapter replaces the global adapter without throwing', () => {
		const noopAdapter: SchemaInputAdapter = {
			isValid: () => false,
			selectParser: () => undefined,
			getRef: () => undefined,
			getMetadata: () => ({}),
		};

		expect(() => registerAdapter(noopAdapter)).not.toThrow();
	});

	it('getGlobalAdapter returns the registered adapter after registration', () => {
		const customAdapter: SchemaInputAdapter = {
			isValid: (input) => typeof input === 'object' && input !== null,
			selectParser: () => undefined,
			getRef: () => undefined,
			getMetadata: () => ({ description: 'custom' }),
		};

		registerAdapter(customAdapter);
		const active = getGlobalAdapter();
		expect(active).toBe(customAdapter);
	});

	it('getGlobalAdapter returns JsonSchemaAdapter after reset', () => {
		registerAdapter(jsonSchemaAdapter);
		const active = getGlobalAdapter();
		expect(active).toBe(jsonSchemaAdapter);
	});
});
