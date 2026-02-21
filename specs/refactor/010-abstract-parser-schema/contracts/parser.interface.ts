/**
 * Parser — minimal contract that every schema parser must satisfy.
 *
 * Extracted from the `BaseParser` abstract class so that lightweight third-party parsers
 * can be registered in the parser registry without inheriting `AbstractParser`'s full
 * template-method infrastructure (pre/post-processors, child context creation, etc.).
 *
 * The `AbstractParser` base class implements this interface and provides the infrastructure
 * for parsers that need it. Parsers that don't need pre/post-processors can implement
 * `Parser` directly.
 *
 * @example Lightweight third-party parser (no AbstractParser dependency):
 * ```ts
 * import type { Parser } from 'x-to-zod';
 * import { build } from './my-build-utils';
 *
 * class MyStringParser implements Parser {
 *   readonly typeKind = 'custom-string';
 *   constructor(private schema: MySchema, private refs: Context) {}
 *   parse() { return build.string(); }
 * }
 * ```
 *
 * @file src/Parser/index.ts
 */

import type { Builder } from '../contracts/builder.interface.js';
import type { Context } from '../../../src/Types.js';

export interface Parser {
  /**
   * Type discriminator string. Used by the registry to identify which parser handles
   * a given schema node, and surfaced in error messages.
   *
   * Examples: `'string'`, `'object'`, `'anyOf'`, `'custom-datetime'`
   */
  readonly typeKind: string;

  /**
   * Parse the schema node this parser was constructed with and return a `Builder`
   * that emits valid Zod code when `.text()` is called.
   */
  parse(): Builder;
}

/**
 * Constructor shape required by the parser registry.
 *
 * The `schema: any` parameter is intentional — it bypasses TypeScript constructor
 * parameter contravariance, allowing concrete parsers with schema-specific constructor
 * types (e.g. `JSONSchemaObject<Version>`) to be registered without modification.
 * Runtime validation is performed by `registerParser` to ensure structural correctness.
 *
 * See: research.md §2 — ParserClass registry type widening.
 */
export type ParserConstructor = new (schema: any, refs: Context) => Parser;
