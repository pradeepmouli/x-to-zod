import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * CodecBuilder: represents z.codec(inSchema, outSchema)
 * Enables bidirectional data transformations
 */
export class CodecBuilder extends ZodBuilder<'codec'> {
	readonly typeKind = 'codec' as const;
	private readonly _inSchema: Builder;
	private readonly _outSchema: Builder;

	constructor(
		inSchema: Builder,
		outSchema: Builder,
		version?: 'v3' | 'v4',
	) {
		super(version);
		this._inSchema = inSchema;
		this._outSchema = outSchema;
	}

	protected override base(): string {
		const inStr = this._inSchema.text();
		const outStr = this._outSchema.text();
		return `z.codec(${inStr},${outStr})`;
	}
}
