import type { ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * HashBuilder: represents z.hash(algorithm) in Zod v4.
 * Validates that a string is a valid hash of the given algorithm.
 */
export class HashBuilder
	extends ZodBuilder<ZodType>
	implements BuilderFor<ZodType>
{
	readonly typeKind = 'string' as const;
	private readonly _algorithm: string;
	private readonly _encoding?: string;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		algorithm: string,
		encoding?: string,
	) {
		super(version);
		this._algorithm = algorithm;
		this._encoding = encoding;
	}

	protected override base(): string {
		const params = this._encoding
			? `${JSON.stringify(this._algorithm)}, { encoding: ${JSON.stringify(this._encoding)} }`
			: JSON.stringify(this._algorithm);
		return `z.hash(${params})`;
	}
}
