import type { z, ZodBigIntFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

type BigIntFormatVariant = 'int64' | 'uint64';

export type BigIntFormatParams = Parameters<typeof z.int64>[0];

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
	private readonly _formatParams?: BigIntFormatParams;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		variant: BigIntFormatVariant,
		params?: BigIntFormatParams,
	) {
		super(version);
		this._variant = variant;
		this._formatParams = params;
	}

	protected override base(): string {
		const paramsStr =
			this._formatParams !== undefined
				? JSON.stringify(this._formatParams)
				: '';
		return paramsStr
			? `z.${this._variant}(${paramsStr})`
			: `z.${this._variant}()`;
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
