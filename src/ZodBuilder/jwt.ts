import type { ZodJWT } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * JwtBuilder: represents z.jwt() in Zod v4.
 */
export class JwtBuilder
	extends StringFormatBuilder<ZodJWT>
	implements BuilderFor<ZodJWT>
{
	readonly typeKind = 'jwt' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}
}
