import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent NeverBuilder: represents z.never() schema.
 */
export class NeverBuilder extends ZodBuilder<'never'> {
	readonly typeKind = 'never' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}

	protected override base(): string {
		return 'z.never()';
	}
}
