import { BaseBuilder } from './BaseBuilder.js';

/**
 * Fluent UnknownBuilder: represents z.unknown() schema.
 */
export class UnknownBuilder extends BaseBuilder<UnknownBuilder> {
	constructor() {
		super('z.unknown()');
	}
}

/**
 * Build a Zod unknown schema string.
 */
export function buildUnknown(): string {
	return 'z.unknown()';
}
