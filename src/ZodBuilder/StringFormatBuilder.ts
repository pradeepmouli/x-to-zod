import type { ZodString, ZodStringFormat, ZodType } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * StringBuilderBase — shared string methods inherited by both
 * StringBuilder (z.string()) and StringFormatBuilder (z.email(), z.uuid(), …).
 *
 * Lives in its own file to break the circular dependency:
 *   string.ts → email.ts → StringFormatBuilder.ts  (no back-edge to string.ts)
 */
export abstract class StringBuilderBase<
	Z extends ZodType = ZodString,
	T extends string = Z extends ZodStringFormat ? Z['def']['format'] : 'string',
	P extends unknown[] = unknown[],
>
	extends ZodBuilder<Z, T, P>
	implements Builder<ZodString, T>
{
	_format?: { format: string; params?: unknown } = undefined;
	_pattern?: { pattern: string; params?: unknown } = undefined;
	_minLength?: { value: number; params?: unknown } = undefined;
	_maxLength?: { value: number; params?: unknown } = undefined;
	_base64?: { params?: unknown } = undefined;
	_json?: { params?: unknown } = undefined;
	_pipe?: { contentSchema: Builder; params?: unknown } = undefined;

	/**
	 * Check if this builder has any constraints applied.
	 */
	hasConstraints(): boolean {
		return !!(
			this._minLength ||
			this._maxLength ||
			this._pattern ||
			this._json ||
			this._pipe
		);
	}

	/** Apply format constraint. */
	format(format: string, params?: unknown): this {
		this._format = { format, params };
		return this;
	}

	/** Apply regex pattern constraint. */
	regex(pattern: string | RegExp, params?: unknown): this {
		this._pattern = {
			pattern: typeof pattern === 'string' ? pattern : pattern.source,
			params,
		};
		return this;
	}

	/** Apply minLength constraint. */
	min(value: number, params?: unknown): this {
		if (this._minLength === undefined || this._minLength.value > value) {
			this._minLength = { value, params };
		}
		return this;
	}

	/** Apply maxLength constraint. */
	max(value: number, params?: unknown): this {
		if (this._maxLength === undefined || this._maxLength.value < value) {
			this._maxLength = { value, params };
		}
		return this;
	}

	/** Apply JSON transform. */
	json(params?: unknown): this {
		this._json = { params };
		return this;
	}

	/** Apply pipe with parsed content schema. */
	pipe(contentSchema: Builder, params?: unknown): this {
		this._pipe = { contentSchema, params };
		return this;
	}

	/* ── BuilderFor stubs ── shared across all string-family builders ── */
	includes(_value: string, _params?: unknown): this {
		return this;
	}
	startsWith(_value: string, _params?: unknown): this {
		return this;
	}
	endsWith(_value: string, _params?: unknown): this {
		return this;
	}
	length(_len: number, _params?: unknown): this {
		return this;
	}
	nonempty(_params?: unknown): this {
		return this;
	}
	lowercase(_params?: unknown): this {
		return this;
	}
	uppercase(_params?: unknown): this {
		return this;
	}
	trim(): this {
		return this;
	}
	normalize(_form?: string): this {
		return this;
	}
	toLowerCase(): this {
		return this;
	}
	toUpperCase(): this {
		return this;
	}
	slugify(): this {
		return this;
	}
	ip(_params?: unknown): this {
		return this;
	}
	safe(_params?: unknown): this {
		return this;
	}
	datetime(_params?: unknown): this {
		return this;
	}
	time(_params?: unknown): this {
		return this;
	}
	date(_params?: unknown): this {
		return this;
	}
	duration(_params?: unknown): this {
		return this;
	}
	guid(_params?: unknown): this {
		return this;
	}
	xid(_params?: unknown): this {
		return this;
	}
	ksuid(_params?: unknown): this {
		return this;
	}
	e164(_params?: unknown): this {
		return this;
	}
}

/**
 * StringFormatBuilder — base for format-specific builders (z.email(), z.uuid(), …).
 * Extends StringBuilderBase so all shared string methods are inherited.
 */
export abstract class StringFormatBuilder<
	F extends ZodStringFormat,
	P extends unknown[] = unknown[],
> extends StringBuilderBase<
	F,
	F extends ZodStringFormat ? F['def']['format'] : 'string',
	P
> {}
