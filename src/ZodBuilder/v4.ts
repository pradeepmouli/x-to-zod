import { z } from 'zod';
import type { Builder } from '../Builder/index.js';
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

export const buildV4 = {
	number: (params?: Parameters<typeof z.number>[0]) =>
		new NumberBuilder(params, 'v4'),
	string: (params?: Parameters<typeof z.string>[0]) =>
		new StringBuilder(params, 'v4'),
	boolean: (params?: Parameters<typeof z.boolean>[0]) =>
		new BooleanBuilder(params, 'v4'),
	null: () => new NullBuilder('v4'),
	array: (
		itemSchemaZod: Builder | Builder[],
		params?: Parameters<typeof z.array>[1],
	) => new ArrayBuilder(itemSchemaZod, params, 'v4'),
	object: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder(properties, params, 'v4'),
	enum: (values: Serializable[]) => new EnumBuilder(values, 'v4'),
	literal: (value: Serializable) => new ConstBuilder(value, 'v4'),
	any: () => new AnyBuilder('v4'),
	never: () => new NeverBuilder('v4'),
	unknown: () => new UnknownBuilder('v4'),
	literalValue: (value: Serializable) => new LiteralBuilder(value, 'v4'),
	code: (code: string) => new GenericBuilder(code, 'v4'),
	raw: (code: string) => new GenericBuilder(code, 'v4'),
	union: (schemas: Builder[]) => new UnionBuilder(schemas, 'v4'),
	intersection: (left: Builder, right: Builder) =>
		new IntersectionBuilder(left, right, 'v4'),
	tuple: (items: Builder[]) => new TupleBuilder(items, 'v4'),
	record: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder(keySchema, valueSchema, 'v4'),
	void: () => new VoidBuilder('v4'),
	undefined: () => new UndefinedBuilder('v4'),
	date: (params?: Parameters<typeof z.date>[0]) =>
		new DateBuilder(params, 'v4'),
	bigint: (params?: Parameters<typeof z.bigint>[0]) =>
		new BigIntBuilder(params, 'v4'),
	symbol: () => new SymbolBuilder('v4'),
	nan: () => new NaNBuilder('v4'),
	set: (itemSchema: Builder) => new SetBuilder(itemSchema, 'v4'),
	map: (keySchema: Builder, valueSchema: Builder) =>
		new MapBuilder(keySchema, valueSchema, 'v4'),
	custom: (validateFn?: string, params?: any) =>
		new CustomBuilder(validateFn, params, 'v4'),
	discriminatedUnion: (discriminator: string, schemas: Builder[]) =>
		new DiscriminatedUnionBuilder(discriminator, schemas, 'v4'),
	// Zod v4 only builders
	promise: (innerSchema: Builder) => new PromiseBuilder(innerSchema, 'v4'),
	lazy: (input: Builder) => new LazyBuilder(input, 'v4'),
	function: (functionSignature: { input?: Builder[]; output?: Builder }) =>
		new FunctionBuilder(functionSignature, 'v4'),
	codec: (inSchema: Builder, outSchema: Builder) =>
		new CodecBuilder(inSchema, outSchema, 'v4'),
	preprocess: (transformFn: string, schema: Builder) =>
		new PreprocessBuilder(transformFn, schema, 'v4'),
	pipe: (sourceSchema: Builder, targetSchema: Builder) =>
		new PipeBuilder(sourceSchema, targetSchema, 'v4'),
	json: () => new JsonBuilder('v4'),
	file: () => new FileBuilder('v4'),
	nativeEnum: (enumReference: string) =>
		new NativeEnumBuilder(enumReference, 'v4'),
	templateLiteral: (parts: (string | Builder)[]) =>
		new TemplateLiteralBuilder(parts, 'v4'),
	xor: (schemas: Builder[]) => new XorBuilder(schemas, 'v4'),
	keyof: (objectSchema: Builder) => new KeyofBuilder(objectSchema, 'v4'),
} as const;
