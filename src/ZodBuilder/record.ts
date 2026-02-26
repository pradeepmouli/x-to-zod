import type { ZodRecord } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent RecordBuilder: represents z.record() schema.
 * Accepts key and value schemas.
 *
 * KEY SCHEMA REQUIREMENT - Version Differences:
 * - Zod v3: z.record(valueSchema) with implicit string keys, or z.record(keySchema, valueSchema)
 * - Zod v4: z.record(keySchema, valueSchema) REQUIRED - single argument form not allowed
 *
 * Implementation: RecordBuilder ALWAYS uses the two-argument form z.record(keySchema, valueSchema)
 * for v3/v4 compatibility. This is the safest and most explicit approach.
 *
 * Typically keySchema is z.string() since JSON object keys are strings.
 * See RECORD-KEY-SCHEMA-NOTES.md for detailed discussion.
 */
export class RecordBuilder extends ZodBuilder<
	ZodRecord,
	'record',
	[keySchema: Builder, valueSchema: Builder]
> {
	readonly typeKind = 'record' as const;
	private readonly _keySchema: Builder;
	private readonly _valueSchema: Builder;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		keySchema: Builder,
		valueSchema: Builder,
	) {
		super(version, keySchema, valueSchema);
		this._keySchema = keySchema;
		this._valueSchema = valueSchema;
	}

	protected override base(): string {
		const keyStr = this._keySchema.text();
		const valueStr = this._valueSchema.text();
		return `z.record(${keyStr}, ${valueStr})`;
	}
}
