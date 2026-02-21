/**
 * T022: Third-party parser registration + dispatch test (Gap 5b).
 *
 * Verifies that:
 * 1. A minimal custom parser can be registered via registerParser().
 * 2. parseSchema dispatches to the registered parser when type matches.
 * 3. The registered parser's output is returned correctly.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { Parser } from '../../src/Parser/index.js';
import {
	registerParser,
	parserRegistry,
} from '../../src/JsonSchema/parsers/registry.js';
import { parseSchema } from '../../src/JsonSchema/parsers/parseSchema.js';
import { buildV4 } from '../../src/ZodBuilder/index.js';
import type { Context } from '../../src/Types.js';

const ctx = (): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
});

describe('registerParser — Gap 5b', () => {
	beforeEach(() => {
		// Clean up any custom registrations after each test
		parserRegistry.delete('x-custom');
	});

	it('registers a minimal parser and dispatches to it via parseSchema', () => {
		class MinimalParser implements Parser {
			readonly typeKind = 'x-custom' as const;
			constructor(
				private _schema: unknown,
				private _refs: Context,
			) {}
			parse() {
				return this._refs.build.any();
			}
		}

		registerParser('x-custom', MinimalParser);
		const result = parseSchema({ type: 'x-custom' } as any, ctx());
		expect(result.text()).toContain('z.any()');
	});

	it('registered parser overrides default fallback for custom type', () => {
		class NumberAliasParser implements Parser {
			readonly typeKind = 'x-custom' as const;
			constructor(
				private _schema: unknown,
				private _refs: Context,
			) {}
			parse() {
				return this._refs.build.number();
			}
		}

		registerParser('x-custom', NumberAliasParser);
		const result = parseSchema({ type: 'x-custom' } as any, ctx());
		expect(result.text()).toContain('z.number()');
	});

	it('registerParser throws when class lacks parse() method', () => {
		class BadParser {
			readonly typeKind = 'x-custom' as const;
			constructor(
				private _schema: any,
				private _refs: any,
			) {}
			// Missing parse() method
		}

		expect(() => registerParser('x-custom', BadParser as any)).toThrow(
			/parse\(\) method/,
		);
	});
});
