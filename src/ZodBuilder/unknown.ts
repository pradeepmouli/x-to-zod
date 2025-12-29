import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent UnknownBuilder: represents z.unknown() schema.
 */
export class UnknownBuilder extends ZodBuilder<'unknown'> {
	readonly typeKind = 'unknown' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}

	protected override base(): string {
		return 'z.unknown()';
	}
}
