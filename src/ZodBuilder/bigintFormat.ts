import type { ZodBigIntFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

type BigIntFormatVariant = 'int64' | 'uint64';

/**
 * BigIntFormatBuilder: represents z.int64(), z.uint64() in Zod v4.
 * These are top-level bigint format constructors.
 */
export class BigIntFormatBuilder
	extends ZodBuilder<ZodBigIntFormat>
	implements BuilderFor<ZodBigIntFormat>
{
	readonly typeKind = 'bigint' as const;
	private readonly _variant: BigIntFormatVariant;

	constructor(version: 'v3' | 'v4' = 'v4', variant: BigIntFormatVariant) {
		super(version);
		this._variant = variant;
	}

	protected override base(): string {
		return `z.${this._variant}()`;
	}

	/* ── BuilderFor<ZodBigIntFormat> stubs ── */
	gt(_value: bigint, _params?: unknown): this {
		return this;
	}
	gte(_value: bigint, _params?: unknown): this {
		return this;
	}
	lt(_value: bigint, _params?: unknown): this {
		return this;
	}
	lte(_value: bigint, _params?: unknown): this {
		return this;
	}
	positive(_params?: unknown): this {
		return this;
	}
	negative(_params?: unknown): this {
		return this;
	}
	nonnegative(_params?: unknown): this {
		return this;
	}
	nonpositive(_params?: unknown): this {
		return this;
	}
	multipleOf(_value: bigint, _params?: unknown): this {
		return this;
	}
	min(_value: bigint, _params?: unknown): this {
		return this;
	}
	max(_value: bigint, _params?: unknown): this {
		return this;
	}
}
