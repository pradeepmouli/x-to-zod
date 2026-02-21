import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent IntersectionBuilder: represents z.intersection() schema.
 * Accepts two schemas and creates an intersection type.
 */
export class IntersectionBuilder extends ZodBuilder<'intersection'> {
	readonly typeKind = 'intersection' as const;
	private readonly _left: Builder;
	private readonly _right: Builder;

	constructor(left: Builder, right: Builder, version?: 'v3' | 'v4') {
		super(version);
		this._left = left;
		this._right = right;
	}

	protected override base(): string {
		const leftStr = this._left.text();
		const rightStr = this._right.text();
		return `z.intersection(${leftStr}, ${rightStr})`;
	}
}
