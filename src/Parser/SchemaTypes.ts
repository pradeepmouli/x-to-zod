/**
 * Infer the `typeKind` string literal from a schema type parameter.
 *
 * If `S` has a `type` property whose type is a string literal (or union of
 * string literals), `InferTypeKind` resolves to that literal.  Otherwise it
 * falls back to `string`, which is the correct bound for composite/keyword
 * parsers that specify `TypeKind` explicitly.
 *
 * This mirrors the builder pattern where
 * `ZodBuilder<Z, T = Z['def']['type']>` infers `T` from `Z`.
 */
export type InferTypeKind<S extends object> = S extends {
	type: infer T extends string;
}
	? T
	: string;
