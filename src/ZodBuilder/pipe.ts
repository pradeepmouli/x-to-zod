import type { ZodPipe } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * PipeBuilder: represents schema.pipe(targetSchema)
 * This is implemented as a modifier on the base schema rather than a standalone builder
 * since pipe is called on an existing schema
 */
export class PipeBuilder extends ZodBuilder<
	ZodPipe,
	'pipe',
	[sourceSchema: Builder, targetSchema: Builder]
> {
	readonly typeKind = 'pipe' as const;
	private readonly _sourceSchema: Builder;
	private readonly _targetSchema: Builder;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		sourceSchema: Builder,
		targetSchema: Builder,
	) {
		super(version, sourceSchema, targetSchema);
		this._sourceSchema = sourceSchema;
		this._targetSchema = targetSchema;
	}

	protected override base(): string {
		const sourceStr = this._sourceSchema.text();
		const targetStr = this._targetSchema.text();
		return `${sourceStr}.pipe(${targetStr})`;
	}
}
