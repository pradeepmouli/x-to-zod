import type { ZodDiscriminatedUnion } from 'zod';
import type { Builder, BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent DiscriminatedUnionBuilder: represents z.discriminatedUnion() schema.
 * Accepts a discriminator key and an array of object schemas.
 */
export class DiscriminatedUnionBuilder
	extends ZodBuilder<
		ZodDiscriminatedUnion,
		'union',
		[discriminator: string, options: Builder[]]
	>
	implements BuilderFor<ZodDiscriminatedUnion>
{
	readonly typeKind = 'union' as const;
	private readonly _discriminator: string;
	private readonly _options: Builder[];

	constructor(
		version: 'v3' | 'v4' = 'v4',
		discriminator: string,
		options: Builder[],
	) {
		super(version, discriminator, options);
		this._discriminator = discriminator;
		this._options = options;
	}

	protected override base(): string {
		const optionStrings = this._options.map((o) => o.text());
		return `z.discriminatedUnion(${JSON.stringify(this._discriminator)}, [${optionStrings.join(', ')}])`;
	}
}
