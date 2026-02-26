import type { ZodCodec, ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * CodecBuilder: represents z.codec(inSchema, outSchema)
 * Enables bidirectional data transformations
 */
export class CodecBuilder<In extends ZodType, Out extends ZodType>
	extends ZodBuilder<
		ZodCodec<In, Out>,
		'pipe',
		[inSchema: BuilderFor<In>, outSchema: BuilderFor<Out>]
	>
	implements BuilderFor<ZodCodec>
{
	readonly typeKind = 'pipe' as const;
	private readonly _inSchema: BuilderFor<In>;
	private readonly _outSchema: BuilderFor<Out>;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		inSchema: BuilderFor<In>,
		outSchema: BuilderFor<Out>,
	) {
		super(version, inSchema, outSchema);
		this._inSchema = inSchema;
		this._outSchema = outSchema;
	}

	protected override base(): string {
		const inStr = this._inSchema.text();
		const outStr = this._outSchema.text();
		return `z.codec(${inStr},${outStr})`;
	}
}
