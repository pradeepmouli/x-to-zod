import { BaseBuilder } from './BaseBuilder.js';

/**
 * Fluent RecordBuilder: represents z.record() schema.
 * Accepts key and value schemas.
 */
export class RecordBuilder extends BaseBuilder {
	private readonly _keySchema: BaseBuilder;
	private readonly _valueSchema: BaseBuilder;

	constructor(
		keySchema: BaseBuilder,
		valueSchema: BaseBuilder,
	) {
		super();
		this._keySchema = keySchema;
		this._valueSchema = valueSchema;
	}

	protected override base(): string {
		const keyStr = this._keySchema.text();
		const valueStr = this._valueSchema.text();
		return `z.record(${keyStr}, ${valueStr})`;
	}
}

/**
 * Build a Zod record schema string.
 */
export function buildRecordSchema(
	keySchema: BaseBuilder,
	valueSchema: BaseBuilder,
): string {
	const keyStr = keySchema.text();
	const valueStr = valueSchema.text();
	return `z.record(${keyStr}, ${valueStr})`;
}
