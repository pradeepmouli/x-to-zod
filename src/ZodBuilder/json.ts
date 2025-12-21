import { ZodBuilder } from './BaseBuilder.js';

/**
 * JsonBuilder: represents z.json()
 * Validates JSON-encoded strings
 */
export class JsonBuilder extends ZodBuilder<'json'> {
	readonly typeKind = 'json' as const;

	protected override base(): string {
		return 'z.json()';
	}
}
