import { z } from 'zod';
import type { ZodType } from 'zod';
import type { Builder, ParamsFor } from '../Builder/index.js';
import type { Serializable } from './types.js';
import { NumberBuilder } from './number.js';
import { StringBuilder } from './string.js';
import { BooleanBuilder } from './boolean.js';
import { NullBuilder } from './null.js';
import { ArrayBuilder } from './array.js';
import type { ArrayCreateParams } from './array.js';
import { ObjectBuilder } from './object.js';
import type { ObjectParams } from './object.js';
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
import { GenericBuilder } from './generic.js';
import { VoidBuilder } from './void.js';
import { UndefinedBuilder } from './undefined.js';
import { DateBuilder } from './date.js';
import { BigIntBuilder } from './bigint.js';
import { SymbolBuilder } from './symbol.js';
import { NaNBuilder } from './nan.js';
import { SetBuilder } from './set.js';
import { MapBuilder } from './map.js';
import { CustomBuilder } from './custom.js';
import { DiscriminatedUnionBuilder } from './discriminatedUnion.js';
import { PromiseBuilder } from './promise.js';
import { LazyBuilder } from './lazy.js';
import { FunctionBuilder } from './function.js';
import { CodecBuilder } from './codec.js';
import { PreprocessBuilder } from './preprocess.js';
import { PipeBuilder } from './pipe.js';
import { JsonBuilder } from './json.js';
import type { JsonParams } from './json.js';
import { FileBuilder } from './file.js';
import type { FileParams } from './file.js';
import { NativeEnumBuilder } from './nativeEnum.js';
import { TemplateLiteralBuilder } from './templateLiteral.js';
import { XorBuilder } from './xor.js';
import { KeyofBuilder } from './keyof.js';
import { CuidBuilder } from './cuid.js';
import type { CuidParams } from './cuid.js';
import { EmailBuilder } from './email.js';
import type { EmailParams } from './email.js';
import { UuidBuilder } from './uuid.js';
import type { UuidParams } from './uuid.js';
import { UrlBuilder } from './url.js';
import type { UrlParams } from './url.js';
import { EmojiBuilder } from './emoji.js';
import type { EmojiParams } from './emoji.js';
import { NanoidBuilder } from './nanoid.js';
import type { NanoidParams } from './nanoid.js';
import { UlidBuilder } from './ulid.js';
import type { UlidParams } from './ulid.js';
import { Base64Builder } from './base64.js';
import type { Base64Params } from './base64.js';
import { Base64UrlBuilder } from './base64url.js';
import type { Base64UrlParams } from './base64url.js';
import { IpBuilder } from './ip.js';
import type {
	Ipv4Params,
	Ipv6Params,
	Cidrv4Params,
	Cidrv6Params,
} from './ip.js';
import { E164Builder } from './e164.js';
import type { E164Params } from './e164.js';
import { JwtBuilder } from './jwt.js';
import type { JwtParams } from './jwt.js';
import { KsuidBuilder } from './ksuid.js';
import type { KsuidParams } from './ksuid.js';
import { XidBuilder } from './xid.js';
import type { XidParams } from './xid.js';
import { MacBuilder } from './mac.js';
import type { MacParams } from './mac.js';
import { HostnameBuilder } from './hostname.js';
import type { HostnameParams } from './hostname.js';
import { HexBuilder } from './hex.js';
import type { HexParams } from './hex.js';
import { HttpUrlBuilder } from './httpUrl.js';
import type { HttpUrlParams } from './httpUrl.js';
import { NumberFormatBuilder } from './numberFormat.js';
import type { NumberFormatParams } from './numberFormat.js';
import { BigIntFormatBuilder } from './bigintFormat.js';
import type { BigIntFormatParams } from './bigintFormat.js';
import { InstanceofBuilder } from './instanceof.js';
import { StringBoolBuilder } from './stringbool.js';
import type { StringBoolParams } from './stringbool.js';
import { CustomStringFormatBuilder } from './stringFormat.js';
import { HashBuilder } from './hash.js';

function buildIsoCode(
	method: 'date' | 'time' | 'datetime' | 'duration',
	params?: unknown,
): string {
	if (params === undefined) {
		return `z.iso.${method}()`;
	}
	return `z.iso.${method}(${JSON.stringify(params)})`;
}

type IsoDateParams = Parameters<(typeof z.iso)['date']>[0];
type IsoTimeParams = Parameters<(typeof z.iso)['time']>[0];
type IsoDatetimeParams = Parameters<(typeof z.iso)['datetime']>[0];
type IsoDurationParams = Parameters<(typeof z.iso)['duration']>[0];

/** Explicit type for the complete Zod v4 builder factory. */
export type BuildV4 = {
	string: (...params: ParamsFor<'string'>) => StringBuilder;
	number: (...params: ParamsFor<'number'>) => NumberBuilder;
	boolean: (...params: ParamsFor<'boolean'>) => BooleanBuilder;
	bigint: (...params: ParamsFor<'bigint'>) => BigIntBuilder;
	symbol: () => SymbolBuilder;
	date: (...params: ParamsFor<'date'>) => DateBuilder;
	null: () => NullBuilder;
	undefined: () => UndefinedBuilder;
	void: () => VoidBuilder;
	any: () => AnyBuilder;
	unknown: () => UnknownBuilder;
	never: () => NeverBuilder;
	nan: () => NaNBuilder;
	email: (params?: EmailParams) => EmailBuilder;
	url: (params?: UrlParams) => UrlBuilder;
	httpUrl: (params?: HttpUrlParams) => HttpUrlBuilder;
	uuid: (params?: UuidParams) => UuidBuilder;
	uuidv4: (params?: UuidParams) => UuidBuilder;
	uuidv6: (params?: UuidParams) => UuidBuilder;
	uuidv7: (params?: UuidParams) => UuidBuilder;
	guid: (params?: UuidParams) => UuidBuilder;
	emoji: (params?: EmojiParams) => EmojiBuilder;
	nanoid: (params?: NanoidParams) => NanoidBuilder;
	cuid: (params?: CuidParams) => CuidBuilder;
	cuid2: (params?: CuidParams) => CuidBuilder;
	ulid: (params?: UlidParams) => UlidBuilder;
	xid: (params?: XidParams) => XidBuilder;
	ksuid: (params?: KsuidParams) => KsuidBuilder;
	e164: (params?: E164Params) => E164Builder;
	base64: (params?: Base64Params) => Base64Builder;
	base64url: (params?: Base64UrlParams) => Base64UrlBuilder;
	ipv4: (params?: Ipv4Params) => IpBuilder;
	ipv6: (params?: Ipv6Params) => IpBuilder;
	cidrv4: (params?: Cidrv4Params) => IpBuilder;
	cidrv6: (params?: Cidrv6Params) => IpBuilder;
	jwt: (params?: JwtParams) => JwtBuilder;
	mac: (params?: MacParams) => MacBuilder;
	hostname: (params?: HostnameParams) => HostnameBuilder;
	hex: (params?: HexParams) => HexBuilder;
	hash: (algorithm: string) => HashBuilder;
	stringFormat: (name: string, validator: string) => CustomStringFormatBuilder;
	int: (params?: NumberFormatParams) => NumberFormatBuilder;
	float32: (params?: NumberFormatParams) => NumberFormatBuilder;
	float64: (params?: NumberFormatParams) => NumberFormatBuilder;
	int32: (params?: NumberFormatParams) => NumberFormatBuilder;
	uint32: (params?: NumberFormatParams) => NumberFormatBuilder;
	int64: (params?: BigIntFormatParams) => BigIntFormatBuilder;
	uint64: (params?: BigIntFormatParams) => BigIntFormatBuilder;
	array: (
		itemSchemaZod: Builder | Builder[],
		params?: ArrayCreateParams,
	) => ArrayBuilder<ZodType>;
	object: (
		properties?: Record<string, Builder>,
		params?: ObjectParams,
	) => ObjectBuilder;
	strictObject: (
		properties?: Record<string, Builder>,
		params?: ObjectParams,
	) => ObjectBuilder;
	looseObject: (
		properties?: Record<string, Builder>,
		params?: ObjectParams,
	) => ObjectBuilder;
	record: (keySchema: Builder, valueSchema: Builder) => RecordBuilder;
	looseRecord: (keySchema: Builder, valueSchema: Builder) => RecordBuilder;
	partialRecord: (keySchema: Builder, valueSchema: Builder) => RecordBuilder;
	tuple: (items: Builder[]) => TupleBuilder;
	set: (itemSchema: Builder) => SetBuilder;
	map: (keySchema: Builder, valueSchema: Builder) => MapBuilder;
	enum: (values: Serializable[] | readonly Serializable[]) => EnumBuilder;
	nativeEnum: (enumReference: string) => NativeEnumBuilder;
	literal: (value: Serializable) => ConstBuilder;
	union: (schemas: Builder[]) => UnionBuilder;
	xor: (schemas: Builder[]) => XorBuilder;
	intersection: (left: Builder, right: Builder) => IntersectionBuilder;
	discriminatedUnion: (
		discriminator: string,
		schemas: Builder[],
	) => DiscriminatedUnionBuilder;
	templateLiteral: (parts: (string | Builder)[]) => TemplateLiteralBuilder;
	keyof: (objectSchema: Builder) => KeyofBuilder;
	promise: (innerSchema: Builder) => PromiseBuilder;
	lazy: (input: Builder) => LazyBuilder;
	function: (functionSignature: {
		input?: Builder[];
		output?: Builder;
	}) => FunctionBuilder;
	codec: (
		inSchema: Builder,
		outSchema: Builder,
	) => CodecBuilder<ZodType, ZodType>;
	preprocess: (transformFn: string, schema: Builder) => PreprocessBuilder;
	pipe: (sourceSchema: Builder, targetSchema: Builder) => PipeBuilder;
	json: (params?: JsonParams) => JsonBuilder;
	file: (params?: FileParams) => FileBuilder;
	custom: (validateFn?: string, params?: unknown) => CustomBuilder;
	instanceof: (className: string) => InstanceofBuilder;
	stringbool: (params?: StringBoolParams) => StringBoolBuilder;
	literalValue: (value: Serializable) => LiteralBuilder;
	code: (code: string) => GenericBuilder;
	raw: (code: string) => GenericBuilder;
	iso: {
		date: (params?: IsoDateParams) => GenericBuilder;
		time: (params?: IsoTimeParams) => GenericBuilder;
		datetime: (params?: IsoDatetimeParams) => GenericBuilder;
		duration: (params?: IsoDurationParams) => GenericBuilder;
	};
};

/**
 * Complete set of Zod v4 schema constructors.
 */
const zodConstructors = {
	// ── Primitives ──
	string: (...params: ParamsFor<'string'>) =>
		new StringBuilder('v4', ...params),
	number: (...params: ParamsFor<'number'>) =>
		new NumberBuilder('v4', ...params),
	boolean: (...params: ParamsFor<'boolean'>) =>
		new BooleanBuilder('v4', ...params),
	bigint: (...params: ParamsFor<'bigint'>) =>
		new BigIntBuilder('v4', ...params),
	symbol: () => new SymbolBuilder('v4'),
	date: (...params: ParamsFor<'date'>) => new DateBuilder('v4', ...params),
	null: () => new NullBuilder('v4'),
	undefined: () => new UndefinedBuilder('v4'),
	void: () => new VoidBuilder('v4'),
	any: () => new AnyBuilder('v4'),
	unknown: () => new UnknownBuilder('v4'),
	never: () => new NeverBuilder('v4'),
	nan: () => new NaNBuilder('v4'),

	// ── String formats (top-level constructors) ──
	email: (params?: Parameters<typeof z.email>[0]) =>
		new EmailBuilder('v4', params),
	url: (params?: Parameters<typeof z.url>[0]) => new UrlBuilder('v4', params),
	httpUrl: (params?: Parameters<typeof z.httpUrl>[0]) =>
		new HttpUrlBuilder('v4', params),
	uuid: (params?: Parameters<typeof z.uuid>[0]) =>
		new UuidBuilder('v4', 'uuid', params),
	uuidv4: (params?: Parameters<typeof z.uuid>[0]) =>
		new UuidBuilder('v4', 'uuid', params),
	uuidv6: (params?: Parameters<typeof z.uuidv6>[0]) =>
		new UuidBuilder('v4', 'uuid', params),
	uuidv7: (params?: Parameters<typeof z.uuidv7>[0]) =>
		new UuidBuilder('v4', 'uuid', params),
	guid: (params?: Parameters<typeof z.guid>[0]) =>
		new UuidBuilder('v4', 'guid', params),
	emoji: (params?: Parameters<typeof z.emoji>[0]) =>
		new EmojiBuilder('v4', params),
	nanoid: (params?: Parameters<typeof z.nanoid>[0]) =>
		new NanoidBuilder('v4', params),
	cuid: (params?: Parameters<typeof z.cuid>[0]) =>
		new CuidBuilder('v4', 'cuid', params),
	cuid2: (params?: Parameters<typeof z.cuid2>[0]) =>
		new CuidBuilder('v4', 'cuid2', params),
	ulid: (params?: Parameters<typeof z.ulid>[0]) =>
		new UlidBuilder('v4', params),
	xid: (params?: Parameters<typeof z.xid>[0]) => new XidBuilder('v4', params),
	ksuid: (params?: Parameters<typeof z.ksuid>[0]) =>
		new KsuidBuilder('v4', params),
	e164: (params?: Parameters<typeof z.e164>[0]) =>
		new E164Builder('v4', params),
	base64: (params?: Parameters<typeof z.base64>[0]) =>
		new Base64Builder('v4', params),
	base64url: (params?: Parameters<typeof z.base64url>[0]) =>
		new Base64UrlBuilder('v4', params),
	ipv4: (params?: Parameters<typeof z.ipv4>[0]) =>
		new IpBuilder('v4', 'ipv4', params),
	ipv6: (params?: Parameters<typeof z.ipv6>[0]) =>
		new IpBuilder('v4', 'ipv6', params),
	cidrv4: (params?: Parameters<typeof z.cidrv4>[0]) =>
		new IpBuilder('v4', 'cidrv4', params),
	cidrv6: (params?: Parameters<typeof z.cidrv6>[0]) =>
		new IpBuilder('v4', 'cidrv6', params),
	jwt: (params?: Parameters<typeof z.jwt>[0]) => new JwtBuilder('v4', params),
	mac: (params?: Parameters<typeof z.mac>[0]) => new MacBuilder('v4', params),
	hostname: (params?: Parameters<typeof z.hostname>[0]) =>
		new HostnameBuilder('v4', params),
	hex: (params?: Parameters<typeof z.hex>[0]) => new HexBuilder('v4', params),
	hash: (algorithm: string) => new HashBuilder('v4', algorithm),
	stringFormat: (name: string, validator: string) =>
		new CustomStringFormatBuilder('v4', name, validator),

	// ── Number formats ──
	int: (params?: Parameters<typeof z.int>[0]) =>
		new NumberFormatBuilder('v4', 'int', params),
	float32: (params?: Parameters<typeof z.float32>[0]) =>
		new NumberFormatBuilder('v4', 'float32', params),
	float64: (params?: Parameters<typeof z.float64>[0]) =>
		new NumberFormatBuilder('v4', 'float64', params),
	int32: (params?: Parameters<typeof z.int32>[0]) =>
		new NumberFormatBuilder('v4', 'int32', params),
	uint32: (params?: Parameters<typeof z.uint32>[0]) =>
		new NumberFormatBuilder('v4', 'uint32', params),

	// ── BigInt formats ──
	int64: (params?: Parameters<typeof z.int64>[0]) =>
		new BigIntFormatBuilder('v4', 'int64', params),
	uint64: (params?: Parameters<typeof z.uint64>[0]) =>
		new BigIntFormatBuilder('v4', 'uint64', params),

	// ── Collections ──
	array: (
		itemSchemaZod: Builder | Builder[],
		params?: Parameters<typeof z.array>[1],
	) => new ArrayBuilder('v4', itemSchemaZod, params),
	object: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder('v4', properties, params),
	strictObject: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder('v4', properties, params).strict(),
	looseObject: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder('v4', properties, params).loose(),
	record: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder('v4', keySchema, valueSchema),
	looseRecord: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder('v4', keySchema, valueSchema),
	partialRecord: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder('v4', keySchema, valueSchema),
	tuple: (items: Builder[]) => new TupleBuilder('v4', items),
	set: (itemSchema: Builder) => new SetBuilder('v4', itemSchema),
	map: (keySchema: Builder, valueSchema: Builder) =>
		new MapBuilder('v4', keySchema, valueSchema),

	// ── Schema combinators ──
	enum: (values: Serializable[] | readonly Serializable[]) =>
		new EnumBuilder('v4', values),
	nativeEnum: (enumReference: string) =>
		new NativeEnumBuilder('v4', enumReference),
	literal: (value: Serializable) => new ConstBuilder('v4', value),
	union: (schemas: Builder[]) => new UnionBuilder('v4', schemas),
	xor: (schemas: Builder[]) => new XorBuilder('v4', schemas),
	intersection: (left: Builder, right: Builder) =>
		new IntersectionBuilder('v4', left, right),
	discriminatedUnion: (discriminator: string, schemas: Builder[]) =>
		new DiscriminatedUnionBuilder('v4', discriminator, schemas),
	templateLiteral: (parts: (string | Builder)[]) =>
		new TemplateLiteralBuilder('v4', parts),
	keyof: (objectSchema: Builder) => new KeyofBuilder('v4', objectSchema),

	// ── Wrappers & transforms ──
	promise: (innerSchema: Builder) => new PromiseBuilder('v4', innerSchema),
	lazy: (input: Builder) => new LazyBuilder('v4', input),
	function: (functionSignature: { input?: Builder[]; output?: Builder }) =>
		new FunctionBuilder('v4', functionSignature),
	codec: (inSchema: Builder, outSchema: Builder) =>
		new CodecBuilder('v4', inSchema, outSchema),
	preprocess: (transformFn: string, schema: Builder) =>
		new PreprocessBuilder('v4', transformFn, schema),
	pipe: (sourceSchema: Builder, targetSchema: Builder) =>
		new PipeBuilder('v4', sourceSchema, targetSchema),
	json: (params?: Parameters<typeof z.json>[0]) =>
		new JsonBuilder('v4', params),
	file: (params?: Parameters<typeof z.file>[0]) =>
		new FileBuilder('v4', params),
	custom: (validateFn?: string, params?: unknown) =>
		new CustomBuilder('v4', validateFn, params),
	instanceof: (className: string) => new InstanceofBuilder('v4', className),
	stringbool: (params?: Parameters<typeof z.stringbool>[0]) =>
		new StringBoolBuilder('v4', params),
} as const;

/**
 * App-level builder helpers that are not part of the Zod namespace.
 * These are convenience aliases used by the parser layer.
 */
const appHelpers = {
	literalValue: (value: Serializable) => new LiteralBuilder('v4', value),
	code: (code: string) => new GenericBuilder('v4', code),
	raw: (code: string) => new GenericBuilder('v4', code),
	iso: {
		date: (params?: Parameters<(typeof z.iso)['date']>[0]) =>
			new GenericBuilder('v4', buildIsoCode('date', params)),
		time: (params?: Parameters<(typeof z.iso)['time']>[0]) =>
			new GenericBuilder('v4', buildIsoCode('time', params)),
		datetime: (params?: Parameters<(typeof z.iso)['datetime']>[0]) =>
			new GenericBuilder('v4', buildIsoCode('datetime', params)),
		duration: (params?: Parameters<(typeof z.iso)['duration']>[0]) =>
			new GenericBuilder('v4', buildIsoCode('duration', params)),
	},
} as const;

export const buildV4: BuildV4 = { ...zodConstructors, ...appHelpers };
