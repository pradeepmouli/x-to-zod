import type { ZodPipe } from 'zod';
import type { Builder, BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * PreprocessBuilder: represents z.preprocess(transformFn, schema)
 * Transforms data before validation
 */
export class PreprocessBuilder
	extends ZodBuilder<ZodPipe, 'pipe', [transformFn: string, schema: Builder]>
	implements BuilderFor<ZodPipe>
{
	readonly typeKind = 'pipe' as const;
	private readonly _preprocessFn: string;
	private readonly _schema: Builder;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		transformFn: string,
		schema: Builder,
	) {
		super(version, transformFn, schema);
		this._preprocessFn = transformFn;
		this._schema = schema;
	}

	protected override base(): string {
		const schemaStr = this._schema.text();
		return `z.preprocess(${this._preprocessFn},${schemaStr})`;
	}
}
