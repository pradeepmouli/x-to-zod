import { BaseBuilder } from './BaseBuilder.js';

/**
 * Fluent DiscriminatedUnionBuilder: represents z.discriminatedUnion() schema.
 * Accepts a discriminator key and an array of object schemas.
 */
export class DiscriminatedUnionBuilder extends BaseBuilder<DiscriminatedUnionBuilder> {
	constructor(
		discriminator: string,
		options: (BaseBuilder<any> | string)[]
	) {
		const optionStrings = options.map(o => typeof o === 'string' ? o : o.text());
		super(`z.discriminatedUnion(${JSON.stringify(discriminator)}, [${optionStrings.join(', ')}])`);
	}
}

/**
 * Build a Zod discriminated union schema string.
 */
export function buildDiscriminatedUnion(
	discriminator: string,
	options: (BaseBuilder<any> | string)[]
): string {
	const optionStrings = options.map(o => typeof o === 'string' ? o : o.text());
	return `z.discriminatedUnion(${JSON.stringify(discriminator)}, [${optionStrings.join(', ')}])`;
}
