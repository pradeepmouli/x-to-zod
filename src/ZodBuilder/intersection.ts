import { BaseBuilder } from './BaseBuilder.js';

/**
 * Fluent IntersectionBuilder: represents z.intersection() schema.
 * Accepts two schemas and creates an intersection type.
 */
export class IntersectionBuilder extends BaseBuilder<IntersectionBuilder> {
	constructor(left: BaseBuilder<any> | string, right: BaseBuilder<any> | string) {
		const leftStr = typeof left === 'string' ? left : left.text();
		const rightStr = typeof right === 'string' ? right : right.text();
		super(`z.intersection(${leftStr}, ${rightStr})`);
	}
}

/**
 * Build a Zod intersection schema string.
 */
export function buildIntersection(
	left: BaseBuilder<any> | string,
	right: BaseBuilder<any> | string
): string {
	const leftStr = typeof left === 'string' ? left : left.text();
	const rightStr = typeof right === 'string' ? right : right.text();
	return `z.intersection(${leftStr}, ${rightStr})`;
}
