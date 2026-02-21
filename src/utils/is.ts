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
import { ZodBuilder } from '../ZodBuilder/BaseBuilder.js';
import { AbstractParser } from '../Parser/AbstractParser.js';

/**
 * Type guard for ZodBuilder base class
 */
export function isZodBuilder(value: unknown): value is ZodBuilder {
	return value instanceof ZodBuilder;
}

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
export function isIntersectionBuilder(
	value: unknown,
): value is IntersectionBuilder {
	return value instanceof IntersectionBuilder;
}

/**
 * Type guard for LazyBuilder
 */
export function isLazyBuilder(value: unknown): value is LazyBuilder {
	return value instanceof LazyBuilder;
}

/**
 * Type guard for BaseParser instances by typeKind discriminator.
 */
export function isParserOfKind<K extends string>(
	value: unknown,
	kind: K,
): value is AbstractParser<K> {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as { typeKind?: unknown; parse?: unknown };
	return candidate.typeKind === kind && typeof candidate.parse === 'function';
}

/**
 * Namespace containing all builder type guards
 */
export const is = {
	zodBuilder: isZodBuilder,
	objectBuilder: isObjectBuilder,
	arrayBuilder: isArrayBuilder,
	stringBuilder: isStringBuilder,
	numberBuilder: isNumberBuilder,
	booleanBuilder: isBooleanBuilder,
	nullBuilder: isNullBuilder,
	unionBuilder: isUnionBuilder,
	intersectionBuilder: isIntersectionBuilder,
	lazyBuilder: isLazyBuilder,
	parserOfKind: isParserOfKind,
};
