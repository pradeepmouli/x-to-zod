// Base builder class
export { ZodBuilder as BaseBuilder } from './BaseBuilder.js';

// Base builders (primitive data → Zod code)
export { BooleanBuilder } from './boolean.js';
export { NullBuilder } from './null.js';
export { ConstBuilder } from './const.js';
export { EnumBuilder } from './enum.js';
export {
	NumberBuilder,
	applyInt,
	applyMultipleOf,
	applyMin as applyNumberMin,
	applyMax as applyNumberMax,
} from './number.js';
export {
	StringBuilder,
	applyFormat,
	applyPattern,
	applyMinLength,
	applyMaxLength,
	applyBase64,
	applyJsonTransform,
	applyPipe,
} from './string.js';
export { ArrayBuilder, applyMinItems, applyMaxItems } from './array.js';
export {
	ObjectBuilder,
	applyStrict,
	applyCatchall,
	applyLoose,
	applyPassthrough,
	applyAnd,
	applyExtend,
	applyMerge,
	applyPick,
	applyOmit,
} from './object.js';

// New builders (Phase 1)
export { AnyBuilder } from './any.js';
export { NeverBuilder } from './never.js';
export { UnknownBuilder } from './unknown.js';
export { LiteralBuilder } from './literal.js';
export { UnionBuilder } from './union.js';
export { IntersectionBuilder } from './intersection.js';
export { DiscriminatedUnionBuilder } from './discriminatedUnion.js';
export { TupleBuilder } from './tuple.js';
export { RecordBuilder } from './record.js';

// Multi-schema project builders
export { ReferenceBuilder } from './reference.js';

// Additional type builders
export { VoidBuilder } from './void.js';
export { UndefinedBuilder } from './undefined.js';
export { DateBuilder, applyDateMin, applyDateMax } from './date.js';
export {
	BigIntBuilder,
	applyBigIntMin,
	applyBigIntMax,
	applyBigIntMultipleOf,
} from './bigint.js';
export { SymbolBuilder } from './symbol.js';
export { NaNBuilder } from './nan.js';
export { SetBuilder, applySetMin, applySetMax, applySetSize } from './set.js';
export { MapBuilder, applyMapMin, applyMapMax, applyMapSize } from './map.js';
export { CustomBuilder } from './custom.js';

// Zod v4 builders
export { PromiseBuilder } from './promise.js';
export { LazyBuilder } from './lazy.js';
export { FunctionBuilder } from './function.js';
export { CodecBuilder } from './codec.js';
export { PreprocessBuilder } from './preprocess.js';
export { PipeBuilder } from './pipe.js';
export { JsonBuilder } from './json.js';
export { FileBuilder } from './file.js';
export { NativeEnumBuilder } from './nativeEnum.js';
export { TemplateLiteralBuilder } from './templateLiteral.js';
export { XorBuilder } from './xor.js';
export { KeyofBuilder } from './keyof.js';

// Zod v4 string format builders
export { EmailBuilder } from './email.js';
export { UrlBuilder } from './url.js';
export { UuidBuilder } from './uuid.js';
export { DatetimeBuilder } from './datetime.js';
export { TimeBuilder } from './time.js';
export { DurationBuilder } from './duration.js';
export { IpBuilder } from './ip.js';
export { Base64Builder } from './base64.js';
export { EmojiBuilder } from './emoji.js';
export { CuidBuilder } from './cuid.js';
export { UlidBuilder } from './ulid.js';
export { NanoidBuilder } from './nanoid.js';

// Import builder classes for the factory
import { NumberBuilder } from './number.js';
import { StringBuilder } from './string.js';
import { BooleanBuilder } from './boolean.js';
import { NullBuilder } from './null.js';
import { ArrayBuilder } from './array.js';
import { ObjectBuilder } from './object.js';
import { EnumBuilder } from './enum.js';
import { ConstBuilder } from './const.js';
import { AnyBuilder } from './any.js';
import { NeverBuilder } from './never.js';
import { UnknownBuilder } from './unknown.js';
import { LiteralBuilder } from './literal.js';
import { UnionBuilder } from './union.js';
import { IntersectionBuilder } from './intersection.js';
import { TupleBuilder } from './tuple.js';
import { RecordBuilder } from './record.js';
// Note: GenericBuilder is no longer used here (escape hatch lives in builders directly)
import { VoidBuilder } from './void.js';
import { UndefinedBuilder } from './undefined.js';
import { DateBuilder } from './date.js';
import { BigIntBuilder } from './bigint.js';
import { SymbolBuilder } from './symbol.js';
import { NaNBuilder } from './nan.js';
import { SetBuilder } from './set.js';
import { MapBuilder } from './map.js';
import { CustomBuilder } from './custom.js';
import { PromiseBuilder } from './promise.js';
import { LazyBuilder } from './lazy.js';
import { FunctionBuilder } from './function.js';
import { CodecBuilder } from './codec.js';
import { PreprocessBuilder } from './preprocess.js';
import { PipeBuilder } from './pipe.js';
import { JsonBuilder } from './json.js';
import { FileBuilder } from './file.js';
import { NativeEnumBuilder } from './nativeEnum.js';
import { TemplateLiteralBuilder } from './templateLiteral.js';
import { XorBuilder } from './xor.js';
import { KeyofBuilder } from './keyof.js';
import { DiscriminatedUnionBuilder } from './discriminatedUnion.js';

// Generic modifiers
export {
	applyOptional,
	applyNullable,
	applyDefault,
	applyDescribe,
	applyBrand,
	applyReadonly,
	applyCatch,
	applyRefine,
	applySuperRefine,
	applyMeta,
	applyTransform,
} from './BaseBuilder.js';

// Builder factories
import { buildV4 } from './v4.js';

export const build = buildV4;

export type TypeKind = {
	[T in keyof typeof buildV4]: ReturnType<(typeof buildV4)[T]>;
};

export type TypeKindOf<T extends keyof TypeKind> = TypeKind[T];

// Version-specific builder exports - import from new factory files
export { buildV3 } from './v3.js';
export { buildV4 } from './v4.js';

// Type exports for version-specific APIs
export type { V3BuildAPI, V4BuildAPI } from './versions.js';
