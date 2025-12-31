import {
	ObjectBuilder,
	ArrayBuilder,
	StringBuilder,
	NumberBuilder,
	BooleanBuilder,
	NullBuilder,
	UnionBuilder,
	IntersectionBuilder,
	LazyBuilder,
} from '../ZodBuilder/index.js';

/**
 * Type guard for ObjectBuilder
 */
export function isObjectBuilder(value: unknown): value is ObjectBuilder {
	return value instanceof ObjectBuilder;
}

/**
 * Type guard for ArrayBuilder
 */
export function isArrayBuilder(value: unknown): value is ArrayBuilder {
	return value instanceof ArrayBuilder;
}

/**
 * Type guard for StringBuilder
 */
export function isStringBuilder(value: unknown): value is StringBuilder {
	return value instanceof StringBuilder;
}

/**
 * Type guard for NumberBuilder
 */
export function isNumberBuilder(value: unknown): value is NumberBuilder {
	return value instanceof NumberBuilder;
}

/**
 * Type guard for BooleanBuilder
 */
export function isBooleanBuilder(value: unknown): value is BooleanBuilder {
	return value instanceof BooleanBuilder;
}

/**
 * Type guard for NullBuilder
 */
export function isNullBuilder(value: unknown): value is NullBuilder {
	return value instanceof NullBuilder;
}

/**
 * Type guard for UnionBuilder
 */
export function isUnionBuilder(value: unknown): value is UnionBuilder {
	return value instanceof UnionBuilder;
}

/**
 * Type guard for IntersectionBuilder
 */
export function isIntersectionBuilder(value: unknown): value is IntersectionBuilder {
	return value instanceof IntersectionBuilder;
}

/**
 * Type guard for LazyBuilder
 */
export function isLazyBuilder(value: unknown): value is LazyBuilder {
	return value instanceof LazyBuilder;
}

/**
 * Namespace containing all builder type guards
 */
export const is = {
	objectBuilder: isObjectBuilder,
	arrayBuilder: isArrayBuilder,
	stringBuilder: isStringBuilder,
	numberBuilder: isNumberBuilder,
	booleanBuilder: isBooleanBuilder,
	nullBuilder: isNullBuilder,
	unionBuilder: isUnionBuilder,
	intersectionBuilder: isIntersectionBuilder,
	lazyBuilder: isLazyBuilder,
};
