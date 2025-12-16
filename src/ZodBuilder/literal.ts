import { BaseBuilder } from './BaseBuilder.js';
import { Serializable } from '../Types.js';

/**
 * Fluent LiteralBuilder: represents z.literal() schema.
 */
export class LiteralBuilder extends BaseBuilder<LiteralBuilder> {
	constructor(value: Serializable) {
		super(`z.literal(${JSON.stringify(value)})`);
	}
}

/**
 * Build a Zod literal schema string.
 */
export function buildLiteralValue(value: Serializable): string {
	return `z.literal(${JSON.stringify(value)})`;
}
