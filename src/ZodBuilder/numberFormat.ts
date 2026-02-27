import type { z, ZodNumberFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

type NumberFormatVariant =
	| 'int'
	| 'float32'
	| 'float64'
	| 'int32'
	| 'uint32'
	| 'int64'
	| 'uint64';

/**
 * NumberFormatBuilder: represents z.int(), z.float32(), z.float64(),
 * z.int32(), z.uint32(), z.int64(), z.uint64() in Zod v4.
 *
 * These are top-level number format constructors that produce constrained
 * number schemas with built-in range/format checks.
 */
export class NumberFormatBuilder
	extends ZodBuilder<ZodNumberFormat>
	implements BuilderFor<ZodNumberFormat>
{
	readonly typeKind = 'number' as const;
	private readonly _variant: NumberFormatVariant;
	private readonly _formatParams?: Parameters<typeof z.int>[0];

	constructor(
		version: 'v3' | 'v4' = 'v4',
		variant: NumberFormatVariant,
		params?: Parameters<typeof z.int>[0],
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

	/* ── BuilderFor<ZodNumberFormat> stubs ── */
	gt(_value: number, _params?: unknown): this {
		return this;
	}
	gte(_value: number, _params?: unknown): this {
		return this;
	}
	lt(_value: number, _params?: unknown): this {
		return this;
	}
	lte(_value: number, _params?: unknown): this {
		return this;
	}
	safe(_params?: unknown): this {
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
	step(_value: number, _params?: unknown): this {
		return this;
	}
	finite(_params?: unknown): this {
		return this;
	}
	min(_value: number, _params?: unknown): this {
		return this;
	}
	max(_value: number, _params?: unknown): this {
		return this;
	}
	int(_params?: unknown): this {
		return this;
	}
	multipleOf(_value: number, _params?: unknown): this {
		return this;
	}
}
