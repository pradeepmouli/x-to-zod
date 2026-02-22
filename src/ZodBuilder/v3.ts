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
import { NativeEnumBuilder } from './nativeEnum.js';

export const buildV3 = {
	number: (params?: Parameters<typeof z.number>[0]) =>
		new NumberBuilder(params, 'v3'),
	string: (params?: Parameters<typeof z.string>[0]) =>
		new StringBuilder(params, 'v3'),
	boolean: (params?: Parameters<typeof z.boolean>[0]) =>
		new BooleanBuilder(params, 'v3'),
	null: () => new NullBuilder('v3'),
	array: (
		itemSchemaZod: Builder | Builder[],
		params?: Parameters<typeof z.array>[1],
	) => new ArrayBuilder(itemSchemaZod, params, 'v3'),
	object: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder(properties, params, 'v3'),
	enum: (values: Serializable[]) => new EnumBuilder(values, 'v3'),
	literal: (value: Serializable) => new ConstBuilder(value, 'v3'),
	any: () => new AnyBuilder('v3'),
	never: () => new NeverBuilder('v3'),
	unknown: () => new UnknownBuilder('v3'),
	literalValue: (value: Serializable) => new LiteralBuilder(value, 'v3'),
	code: (code: string) => new GenericBuilder(code, 'v3'),
	raw: (code: string) => new GenericBuilder(code, 'v3'),
	union: (schemas: Builder[]) => new UnionBuilder(schemas, 'v3'),
	intersection: (left: Builder, right: Builder) =>
		new IntersectionBuilder(left, right, 'v3'),
	tuple: (items: Builder[]) => new TupleBuilder(items, 'v3'),
	record: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder(keySchema, valueSchema, 'v3'),
	void: () => new VoidBuilder('v3'),
	undefined: () => new UndefinedBuilder('v3'),
	date: (params?: Parameters<typeof z.date>[0]) =>
		new DateBuilder(params, 'v3'),
	bigint: (params?: Parameters<typeof z.bigint>[0]) =>
		new BigIntBuilder(params, 'v3'),
	symbol: () => new SymbolBuilder('v3'),
	nan: () => new NaNBuilder('v3'),
	set: (itemSchema: Builder) => new SetBuilder(itemSchema, 'v3'),
	map: (keySchema: Builder, valueSchema: Builder) =>
		new MapBuilder(keySchema, valueSchema, 'v3'),
	custom: (validateFn?: string, params?: any) =>
		new CustomBuilder(validateFn, params, 'v3'),
	discriminatedUnion: (discriminator: string, schemas: Builder[]) =>
		new DiscriminatedUnionBuilder(discriminator, schemas, 'v3'),
	nativeEnum: (enumReference: string) =>
		new NativeEnumBuilder(enumReference, 'v3'),
} as const;
