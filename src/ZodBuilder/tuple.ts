import type { ZodTuple } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent TupleBuilder: represents z.tuple() schema.
 * Accepts an array of schemas representing tuple items.
 */
export class TupleBuilder extends ZodBuilder<
	ZodTuple,
	'tuple',
	[items: Builder[]]
> {
	readonly typeKind = 'tuple' as const;
	private readonly _items: Builder[];

	constructor(version: 'v3' | 'v4' = 'v4', items: Builder[] = []) {
		super(version, items);
		this._items = items;
	}

	protected override base(): string {
		const itemStrings = this._items.map((item) => item.text());
		return `z.tuple([${itemStrings.join(',')}])`; // No space after comma to match buildTuple
	}
}
