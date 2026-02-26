import { z } from 'zod';
import type { Builder, ParamsFor } from '../Builder/index.js';
import type { Serializable } from '../Types.js';
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
import { FileBuilder } from './file.js';
import { NativeEnumBuilder } from './nativeEnum.js';
import { TemplateLiteralBuilder } from './templateLiteral.js';
import { XorBuilder } from './xor.js';
import { KeyofBuilder } from './keyof.js';
import { CuidBuilder } from './cuid.js';
import { EmailBuilder } from './email.js';
import { UuidBuilder } from './uuid.js';
import { UrlBuilder } from './url.js';
import { EmojiBuilder } from './emoji.js';
import { NanoidBuilder } from './nanoid.js';
import { UlidBuilder } from './ulid.js';
import { Base64Builder } from './base64.js';
import { Base64UrlBuilder } from './base64url.js';
import { IpBuilder } from './ip.js';
import { E164Builder } from './e164.js';
import { JwtBuilder } from './jwt.js';
import { KsuidBuilder } from './ksuid.js';
import { XidBuilder } from './xid.js';
import { MacBuilder } from './mac.js';
import { HostnameBuilder } from './hostname.js';
import { HexBuilder } from './hex.js';
import { HttpUrlBuilder } from './httpUrl.js';
import { NumberFormatBuilder } from './numberFormat.js';
import { BigIntFormatBuilder } from './bigintFormat.js';
import { InstanceofBuilder } from './instanceof.js';
import { StringBoolBuilder } from './stringbool.js';
import { CustomStringFormatBuilder } from './stringFormat.js';
import { HashBuilder } from './hash.js';

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
	httpUrl: () => new HttpUrlBuilder('v4'),
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
	xid: () => new XidBuilder('v4'),
	ksuid: () => new KsuidBuilder('v4'),
	e164: () => new E164Builder('v4'),
	base64: (params?: Parameters<typeof z.base64>[0]) =>
		new Base64Builder('v4', params),
	base64url: (_params?: Parameters<typeof z.base64url>[0]) =>
		new Base64UrlBuilder('v4'),
	ipv4: (params?: Parameters<typeof z.ipv4>[0]) =>
		new IpBuilder('v4', 'ipv4', params),
	ipv6: (params?: Parameters<typeof z.ipv6>[0]) =>
		new IpBuilder('v4', 'ipv6', params),
	cidrv4: (params?: Parameters<typeof z.cidrv4>[0]) =>
		new IpBuilder('v4', 'cidrv4', params),
	cidrv6: (params?: Parameters<typeof z.cidrv6>[0]) =>
		new IpBuilder('v4', 'cidrv6', params),
	jwt: () => new JwtBuilder('v4'),
	mac: () => new MacBuilder('v4'),
	hostname: () => new HostnameBuilder('v4'),
	hex: () => new HexBuilder('v4'),
	hash: (algorithm: string) => new HashBuilder('v4', algorithm),
	stringFormat: (name: string, validator: string) =>
		new CustomStringFormatBuilder('v4', name, validator),

	// ── Number formats ──
	int: () => new NumberFormatBuilder('v4', 'int'),
	float32: () => new NumberFormatBuilder('v4', 'float32'),
	float64: () => new NumberFormatBuilder('v4', 'float64'),
	int32: () => new NumberFormatBuilder('v4', 'int32'),
	uint32: () => new NumberFormatBuilder('v4', 'uint32'),

	// ── BigInt formats ──
	int64: () => new BigIntFormatBuilder('v4', 'int64'),
	uint64: () => new BigIntFormatBuilder('v4', 'uint64'),

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
	enum: (values: Serializable[]) => new EnumBuilder('v4', values),
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
	json: () => new JsonBuilder('v4'),
	file: () => new FileBuilder('v4'),
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
} as const;

export const buildV4 = { ...zodConstructors, ...appHelpers } as const;
