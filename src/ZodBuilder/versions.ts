/**
 * Version-specific type definitions for Zod builders.
 * This file defines which builder methods are available in each Zod version.
 */

import type { ZodBuilder } from './BaseBuilder.js';
import type { Options } from '../Types.js';

// V4-only builder types (not available in v3)
export type V4OnlyBuilders = {
	promise: (innerSchema: ZodBuilder, options?: Options) => ZodBuilder;
	lazy: (input: ZodBuilder, options?: Options) => ZodBuilder;
	function: (
		functionSignature?: {
			input?: ZodBuilder[];
			output?: ZodBuilder;
		},
		options?: Options,
	) => ZodBuilder;
	codec: (
		inSchema: ZodBuilder,
		outSchema: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	preprocess: (
		transformFn: string,
		schema: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	pipe: (
		sourceSchema: ZodBuilder,
		targetSchema: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	json: (options?: Options) => ZodBuilder;
	file: (options?: Options) => ZodBuilder;
	nativeEnum: (enumReference: string, options?: Options) => ZodBuilder;
	templateLiteral: (
		parts: (string | ZodBuilder)[],
		options?: Options,
	) => ZodBuilder;
	xor: (schemas: ZodBuilder[], options?: Options) => ZodBuilder;
	keyof: (objectSchema: ZodBuilder, options?: Options) => ZodBuilder;
};

// Core builders available in both v3 and v4
export type CoreBuilders = {
	number: (options?: Options) => ZodBuilder;
	string: (options?: Options) => ZodBuilder;
	boolean: (options?: Options) => ZodBuilder;
	null: (options?: Options) => ZodBuilder;
	array: (
		itemSchemaZod: ZodBuilder | ZodBuilder[],
		options?: Options,
	) => ZodBuilder;
	object: (
		properties?: Record<string, ZodBuilder>,
		options?: Options,
	) => ZodBuilder;
	enum: (values: any[], options?: Options) => ZodBuilder;
	literal: (value: any, options?: Options) => ZodBuilder;
	any: (options?: Options) => ZodBuilder;
	never: (options?: Options) => ZodBuilder;
	unknown: (options?: Options) => ZodBuilder;
	literalValue: (value: any, options?: Options) => ZodBuilder;
	code: (code: string, options?: Options) => ZodBuilder;
	raw: (code: string, options?: Options) => ZodBuilder;
	union: (schemas: ZodBuilder[], options?: Options) => ZodBuilder;
	intersection: (
		left: ZodBuilder,
		right: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	tuple: (items: ZodBuilder[], options?: Options) => ZodBuilder;
	record: (
		keySchema: ZodBuilder,
		valueSchema: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	void: (options?: Options) => ZodBuilder;
	undefined: (options?: Options) => ZodBuilder;
	date: (options?: Options) => ZodBuilder;
	bigint: (options?: Options) => ZodBuilder;
	symbol: (options?: Options) => ZodBuilder;
	nan: (options?: Options) => ZodBuilder;
	set: (itemSchema: ZodBuilder, options?: Options) => ZodBuilder;
	map: (
		keySchema: ZodBuilder,
		valueSchema: ZodBuilder,
		options?: Options,
	) => ZodBuilder;
	custom: (validateFn?: string, params?: any, options?: Options) => ZodBuilder;
	discriminatedUnion: (
		discriminator: string,
		schemas: ZodBuilder[],
		options?: Options,
	) => ZodBuilder;
};

// V3 build API (core builders only)
export type V3BuildAPI = CoreBuilders;

// V4 build API (core builders + v4-only builders)
export type V4BuildAPI = CoreBuilders & V4OnlyBuilders;
