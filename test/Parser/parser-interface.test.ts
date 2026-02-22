/**
 * T021: Parser interface type-level test (Gap 5a).
 *
 * These tests verify that:
 * 1. A minimal class implementing Parser can be assigned to a Parser-typed variable.
 * 2. The AbstractParser base class satisfies the Parser interface.
 * 3. Concrete JSON Schema parsers are assignable to Parser.
 */
import { describe, it, expect } from 'vitest';
import type { Parser, ParserConstructor } from '../../src/Parser/index.js';
import { AbstractParser } from '../../src/Parser/AbstractParser.js';
import { buildV4 } from '../../src/ZodBuilder/index.js';
import type { Context } from '../../src/Types.js';

const ctx = (): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
});

describe('Parser interface — Gap 5a', () => {
	it('a minimal class satisfies the Parser interface structurally', () => {
		class MinimalParser implements Parser {
			readonly typeKind = 'x-minimal' as const;
			constructor(
				private _schema: unknown,
				private _refs: Context,
			) {}
			parse() {
				return this._refs.build.any();
			}
		}

		const instance = new MinimalParser({}, ctx());
		const p: Parser = instance;
		expect(p.typeKind).toBe('x-minimal');
		expect(p.parse).toBeTypeOf('function');
	});

	it('AbstractParser subclass satisfies the Parser interface', () => {
		class ConcreteParser extends AbstractParser<'test'> {
			readonly typeKind = 'test' as const;
			protected parseImpl() {
				return this.refs.build.string();
			}
		}

		const instance = new ConcreteParser({ type: 'string' }, ctx());
		const p: Parser = instance;
		expect(p.typeKind).toBe('test');
	});

	it('ParserConstructor type accepts minimal parser constructor', () => {
		class MinimalParser implements Parser {
			readonly typeKind = 'x' as const;
			constructor(
				private _schema: any,
				private _refs: Context,
			) {}
			parse() {
				return this._refs.build.any();
			}
		}

		const ctor: ParserConstructor = MinimalParser;
		const instance = new ctor({}, ctx());
		expect(instance.typeKind).toBe('x');
		expect(typeof instance.parse).toBe('function');
	});

	it('Parser.parse() returns a Builder with .text()', () => {
		class StringParser implements Parser {
			readonly typeKind = 'string' as const;
			constructor(
				private _schema: unknown,
				private refs: Context,
			) {}
			parse() {
				return this.refs.build.string();
			}
		}

		const p: Parser = new StringParser({}, ctx());
		const result = p.parse();
		expect(result.text()).toContain('z.string()');
	});
});
