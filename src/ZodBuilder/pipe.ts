import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * PipeBuilder: represents schema.pipe(targetSchema)
 * This is implemented as a modifier on the base schema rather than a standalone builder
 * since pipe is called on an existing schema
 */
export class PipeBuilder extends ZodBuilder<'pipe'> {
	readonly typeKind = 'pipe' as const;
	private readonly _sourceSchema: Builder;
	private readonly _targetSchema: Builder;

	constructor(
		sourceSchema: Builder,
		targetSchema: Builder,
		version?: 'v3' | 'v4',
	) {
		super(version);
		this._sourceSchema = sourceSchema;
		this._targetSchema = targetSchema;
	}

	protected override base(): string {
		const sourceStr = this._sourceSchema.text();
		const targetStr = this._targetSchema.text();
		return `${sourceStr}.pipe(${targetStr})`;
	}
}
