import { ZodBuilder } from './BaseBuilder.js';

/**
 * VoidBuilder: represents z.void()
 */
export class VoidBuilder extends ZodBuilder<'void'> {
	readonly typeKind = 'void' as const;

	protected override base(): string {
		return 'z.void()';
	}
}
