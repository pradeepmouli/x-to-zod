/**
 * SchemaInput — semantic type alias for any schema value passed into the pipeline.
 *
 * The core pipeline accepts `SchemaInput` values and delegates all shape inspection
 * to the active `SchemaInputAdapter`. No structural constraint is placed on the type
 * itself because adapters own validity and parsing decisions.
 *
 * See: research.md §4 — SchemaInput type design.
 *
 * @file src/SchemaInput/index.ts (type alias portion)
 */
export type SchemaInput = unknown;

// ---------------------------------------------------------------------------

/**
 * SchemaMetadata — normalised field bag extracted by a `SchemaInputAdapter` from
 * a schema node. Used by `AbstractParser.applyMetadata` to apply modifiers that
 * are common across all input formats (description, default value, readOnly flag).
 */
export interface SchemaMetadata {
  /**
   * Human-readable description of the schema node.
   * Maps to `.describe()` on the resulting `Builder`.
   */
  description?: string;

  /**
   * Default value when the field is absent.
   * Maps to `.default()` on the resulting `Builder`.
   */
  default?: unknown;

  /**
   * Whether the field is read-only.
   * Maps to `.readonly()` on the resulting `Builder`.
   */
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------

/**
 * SchemaInputAdapter — protocol for plugging alternative input formats into the
 * x-to-zod parsing pipeline.
 *
 * Implement this interface to teach x-to-zod about a new schema format (TypeScript
 * types, GraphQL SDL, Protobuf IDL, OpenAPI, …) without modifying any core file.
 *
 * @example Minimal custom adapter:
 * ```ts
 * import type { SchemaInputAdapter, SchemaMetadata, ParserConstructor } from 'x-to-zod';
 *
 * interface MySchema { _kind: string; label?: string }
 *
 * class MyAdapter implements SchemaInputAdapter {
 *   isValid(input: unknown): input is MySchema {
 *     return typeof input === 'object' && input !== null && '_kind' in input;
 *   }
 *   selectParser(input: unknown, refs) {
 *     const schema = input as MySchema;
 *     return myParserRegistry.get(schema._kind);
 *   }
 *   getRef(input: unknown) { return undefined; }
 *   getMetadata(input: unknown): SchemaMetadata {
 *     const schema = input as MySchema;
 *     return { description: schema.label };
 *   }
 * }
 *
 * registerAdapter(new MyAdapter());
 * ```
 *
 * @file src/SchemaInput/index.ts (interface portion)
 */

import type { ParserConstructor } from '../contracts/parser.interface.js';
import type { Context } from '../../../src/Types.js';

export interface SchemaInputAdapter {
  /**
   * Return `true` if this adapter can handle the given `input`.
   *
   * Called at the top of `parseSchema` to decide whether to proceed. If `false`,
   * `parseSchema` falls through to boolean-schema handling or throws.
   *
   * @param input - Raw value passed to `parseSchema` or the recursive parser.
   */
  isValid(input: unknown): boolean;

  /**
   * Return the parser constructor class responsible for handling `input`, or
   * `undefined` to fall back to the default parse behaviour.
   *
   * Replaces the hard-coded `selectParserClass(schema)` call in `parseSchema.ts`.
   *
   * @param input - Schema node (already validated by `isValid`).
   * @param refs  - Current execution context.
   */
  selectParser(input: unknown, refs: Context): ParserConstructor | undefined;

  /**
   * Extract the `$ref` string from `input` if it is a JSON Reference node, or
   * return `undefined` if `input` is not a reference.
   *
   * Replaces `schema.$ref` field access in `parseSchema.ts` ref-resolution block.
   *
   * @param input - Schema node to inspect.
   */
  getRef(input: unknown): string | undefined;

  /**
   * Extract normalised metadata from `input` for use by `AbstractParser.applyMetadata`.
   *
   * All fields are optional — the adapter returns only the fields it knows about.
   * Missing fields are silently ignored (no modifier applied).
   *
   * @param input - Schema node to inspect.
   */
  getMetadata(input: unknown): SchemaMetadata;
}

// ---------------------------------------------------------------------------

/**
 * registerAdapter — register a `SchemaInputAdapter` as the active pipeline adapter.
 *
 * The registered adapter replaces the default `JsonSchemaAdapter` for the current
 * process. Call before invoking `jsonSchemaToZod` / `parseSchema`.
 *
 * @example
 * ```ts
 * import { registerAdapter } from 'x-to-zod';
 * registerAdapter(new MyGraphQLAdapter());
 * jsonSchemaToZod(myGraphQLType);  // now handled by MyGraphQLAdapter
 * ```
 *
 * NOTE: This is a global side-effect. For per-call adapter selection, pass `adapter`
 * directly in the `Options` object (see `Context.adapter`).
 *
 * @file src/SchemaInput/index.ts (function portion)
 */
export declare function registerAdapter(adapter: SchemaInputAdapter): void;
