import { BaseParser } from './BaseParser.js';
import type { JSONSchemaAny as JSONSchema } from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { parseSchema } from './parseSchema.js';
import { half } from '../../utils/half.js';

const originalIndex = Symbol('Original index');

/**
 * Ensures all items in array have originalIndex for tracking.
 */
const ensureOriginalIndex = (arr: JSONSchema[]) => {
	const newArr = [];

	for (let i = 0; i < arr.length; i++) {
		const item = arr[i];
		if (typeof item === 'boolean') {
			newArr.push(
				item ? { [originalIndex]: i } : { [originalIndex]: i, not: {} },
			);
		} else if (originalIndex in (item as Record<symbol, unknown>)) {
			return arr;
		} else {
			newArr.push({ ...item, [originalIndex]: i });
		}
	}

	return newArr;
};

/**
 * Parser for JSON Schema allOf keyword.
 * Converts allOf constraints to Zod intersection.
 */
export class AllOfParser extends BaseParser<'allOf'> {
	readonly typeKind = 'allOf' as const;

	protected parseImpl(schema: JSONSchema): Builder {
		const allOfSchema = schema as { allOf?: JSONSchema[] };
		const allOf = allOfSchema.allOf || [];

		if (allOf.length === 0) {
			return this.refs.build.never();
		}

		if (allOf.length === 1) {
			const item = allOf[0];
			const itemIndex = (item as any)[originalIndex];
			return parseSchema(item, {
				...this.refs,
				path: [...(this.refs.path || []), 'allOf', itemIndex],
			});
		}

		const [left, right] = half(ensureOriginalIndex(allOf)) as JSONSchema[][];
		const leftBuilder = new AllOfParser({ allOf: left }, this.refs).parseImpl({
			allOf: left,
		});
		const rightBuilder = new AllOfParser({ allOf: right }, this.refs).parseImpl(
			{
				allOf: right,
			},
		);

		return this.refs.build.intersection(leftBuilder, rightBuilder);
	}
}
