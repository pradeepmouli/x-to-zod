import type { ZodTemplateLiteral } from 'zod';
import type { Builder, BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * TemplateLiteralBuilder: represents z.templateLiteral(parts)
 * Validates template literal string types
 */
export class TemplateLiteralBuilder
	extends ZodBuilder<ZodTemplateLiteral>
	implements BuilderFor<ZodTemplateLiteral>
{
	readonly typeKind = 'template_literal' as const;
	private readonly _parts: (string | Builder)[];

	constructor(version: 'v3' | 'v4' = 'v4', parts: (string | Builder)[]) {
		super(version);
		this._parts = parts;
	}

	protected override base(): string {
		const partsStr = this._parts
			.map((part) => {
				if (typeof part === 'string') {
					return JSON.stringify(part);
				}
				return part.text();
			})
			.join(',');
		return `z.templateLiteral([${partsStr}])`;
	}
}
