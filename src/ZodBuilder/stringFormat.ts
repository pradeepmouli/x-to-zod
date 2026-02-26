import type { ZodCustomStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * CustomStringFormatBuilder: represents z.stringFormat(name, fn) in Zod v4.
 * Creates a custom string format with a user-defined format name and validation function.
 */
export class CustomStringFormatBuilder
	extends StringFormatBuilder<ZodCustomStringFormat>
	implements BuilderFor<ZodCustomStringFormat>
{
	readonly typeKind = 'string_format' as const;
	private readonly _formatName: string;
	private readonly _validator: string;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		formatName: string,
		validator: string,
	) {
		super(version);
		this._formatName = formatName;
		this._validator = validator;
	}

	protected override base(): string {
		return `z.stringFormat(${JSON.stringify(this._formatName)}, ${this._validator})`;
	}
}
