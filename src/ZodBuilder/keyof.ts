import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * KeyofBuilder: represents z.keyof(objectSchema)
 * Extracts keys from an object schema as an enum
 */
export class KeyofBuilder extends ZodBuilder<'keyof'> {
	readonly typeKind = 'keyof' as const;
	private readonly _objectSchema: Builder;

	constructor(objectSchema: Builder, version?: 'v3' | 'v4') {
		super(version);
		this._objectSchema = objectSchema;
	}

	protected override base(): string {
		const objectStr = this._objectSchema.text();
		return `z.keyof(${objectStr})`;
	}
}
