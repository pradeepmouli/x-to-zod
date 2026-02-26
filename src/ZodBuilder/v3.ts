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
import { NativeEnumBuilder } from './nativeEnum.js';

export const buildV3 = {
	number: (...params: ParamsFor<'number'>) =>
		new NumberBuilder('v3', ...params),
	string: (...params: ParamsFor<'string'>) =>
		new StringBuilder('v3', ...params),
	boolean: (...params: ParamsFor<'boolean'>) =>
		new BooleanBuilder('v3', ...params),
	null: () => new NullBuilder('v3'),
	array: (
		itemSchemaZod: Builder | Builder[],
		params?: Parameters<typeof z.array>[1],
	) => new ArrayBuilder('v3', itemSchemaZod, params),
	object: (
		properties: Record<string, Builder> = {},
		params?: Parameters<typeof z.object>[1],
	) => new ObjectBuilder('v3', properties, params),
	enum: (values: Serializable[]) => new EnumBuilder('v3', values),
	literal: (value: Serializable) => new ConstBuilder('v3', value),
	any: () => new AnyBuilder('v3'),
	never: () => new NeverBuilder('v3'),
	unknown: () => new UnknownBuilder('v3'),
	literalValue: (value: Serializable) => new LiteralBuilder('v3', value),
	code: (code: string) => new GenericBuilder('v3', code),
	raw: (code: string) => new GenericBuilder('v3', code),
	union: (schemas: Builder[]) => new UnionBuilder('v3', schemas),
	intersection: (left: Builder, right: Builder) =>
		new IntersectionBuilder('v3', left, right),
	tuple: (items: Builder[]) => new TupleBuilder('v3', items),
	record: (keySchema: Builder, valueSchema: Builder) =>
		new RecordBuilder('v3', keySchema, valueSchema),
	void: () => new VoidBuilder('v3'),
	undefined: () => new UndefinedBuilder('v3'),
	date: (...params: ParamsFor<'date'>) => new DateBuilder('v3', ...params),
	bigint: (...params: ParamsFor<'bigint'>) =>
		new BigIntBuilder('v3', ...params),
	symbol: () => new SymbolBuilder('v3'),
	nan: () => new NaNBuilder('v3'),
	set: (itemSchema: Builder) => new SetBuilder('v3', itemSchema),
	map: (keySchema: Builder, valueSchema: Builder) =>
		new MapBuilder('v3', keySchema, valueSchema),
	custom: (validateFn?: string, params?: unknown) =>
		new CustomBuilder('v3', validateFn, params),
	discriminatedUnion: (discriminator: string, schemas: Builder[]) =>
		new DiscriminatedUnionBuilder('v3', discriminator, schemas),
	nativeEnum: (enumReference: string) =>
		new NativeEnumBuilder('v3', enumReference),
} as const;
