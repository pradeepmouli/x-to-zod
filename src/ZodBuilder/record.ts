import { BaseBuilder } from './BaseBuilder.js';

/**
 * Fluent RecordBuilder: represents z.record() schema.
 * Accepts key and value schemas.
 */
export class RecordBuilder extends BaseBuilder<RecordBuilder> {
	constructor(
		keySchema: BaseBuilder<any> | string,
		valueSchema: BaseBuilder<any> | string
	) {
		const keyStr = typeof keySchema === 'string' ? keySchema : keySchema.text();
		const valueStr = typeof valueSchema === 'string' ? valueSchema : valueSchema.text();
		super(`z.record(${keyStr}, ${valueStr})`);
	}
}

/**
 * Build a Zod record schema string.
 */
export function buildRecordSchema(
	keySchema: BaseBuilder<any> | string,
	valueSchema: BaseBuilder<any> | string
): string {
	const keyStr = typeof keySchema === 'string' ? keySchema : keySchema.text();
	const valueStr = typeof valueSchema === 'string' ? valueSchema : valueSchema.text();
	return `z.record(${keyStr}, ${valueStr})`;
}
