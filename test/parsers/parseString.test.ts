import { describe, it, expect } from 'vitest';
import { parseString as parseStringImpl } from '../../src/JsonSchema/parsers/parseString.js';
import type { Context } from '../../src/Types';
import { buildV3, buildV4 } from '../../src/ZodBuilder/index.js';

const refsV3: Context = { path: [], seen: new Map(), build: buildV3, zodVersion: 'v3' };
const refsV4: Context = { path: [], seen: new Map(), build: buildV4, zodVersion: 'v4' };
const parseString = (
	schema: Parameters<typeof parseStringImpl>[0],
	refs: Context = refsV4,
) => parseStringImpl(schema, refs);

describe('parseString', () => {
	const run = (output: string, data: unknown) =>
		eval(
			`const {z} = require("zod"); ${output}.safeParse(${JSON.stringify(data)})`,
		);

	it('DateTime format', () => {
		const datetime = '2018-11-13T20:20:39Z';

		const code = parseString({
			type: 'string',
			format: 'date-time',
			errorMessage: { format: 'hello' },
		}).text();

		expect(code).toBe(
			'z.string().datetime({ offset: true, message: "hello" })',
		);

		expect(run(code, datetime)).toEqual({ success: true, data: datetime });
	});

	it('email', () => {
		expect(
			parseString({
				type: 'string',
				format: 'email',
			}).text(),
		).toBe('z.string().email()');
	});

	it('ip', () => {
		expect(
			parseString({
				type: 'string',
				format: 'ip',
			}).text(),
		).toBe('z.string().ip()');
		expect(
			parseString({
				type: 'string',
				format: 'ipv6',
			}).text(),
		).toBe(`z.string().ip({ version: "v6" })`);
	});

	it('uri', () => {
		expect(
			parseString({
				type: 'string',
				format: 'uri',
			}).text(),
		).toBe(`z.string().url()`);
	});

	it('uuid', () => {
		expect(
			parseString({
				type: 'string',
				format: 'uuid',
			}).text(),
		).toBe(`z.string().uuid()`);
	});

	it('base64 (v3 mode)', () => {
		expect(
			parseString(
				{
					type: 'string',
					contentEncoding: 'base64',
				},
				refsV3,
			).text(),
		).toBe('z.string().base64()');
		expect(
			parseString(
				{
					type: 'string',
					contentEncoding: 'base64',
					errorMessage: {
						contentEncoding: 'x',
					},
				},
				refsV3,
			).text(),
		).toBe('z.string().base64("x")');
	});

	it('base64 (v4 mode)', () => {
		expect(
			parseString(
				{
					type: 'string',
					contentEncoding: 'base64',
				},
				refsV4,
			).text(),
		).toBe('z.base64()');
		expect(
			parseString(
				{
					type: 'string',
					contentEncoding: 'base64',
					errorMessage: {
						contentEncoding: 'x',
					},
				},
				refsV4,
			).text(),
		).toBe('z.base64({ error: "x" })');
	});

	it('duration', () => {
		expect(
			parseString({
				type: 'string',
				format: 'duration',
			}).text(),
		).toBe(`z.string().duration()`);
	});

	it('stringified JSON', () => {
		expect(
			parseString({
				type: 'string',
				contentMediaType: 'application/json',
				contentSchema: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
						},
						age: {
							type: 'integer',
						},
					},
					required: ['name', 'age'],
				},
			}).text(),
		).toBe(
			'z.string().transform((str, ctx) => { try { return JSON.parse(str); } catch (err) { ctx.addIssue({ code: "custom", message: "Invalid JSON" }); }}).pipe(z.object({ "name": z.string(), "age": z.number().int() }))',
		);
		expect(
			parseString({
				type: 'string',
				contentMediaType: 'application/json',
				contentSchema: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
						},
						age: {
							type: 'integer',
						},
					},
					required: ['name', 'age'],
				},
				errorMessage: {
					contentMediaType: 'x',
					contentSchema: 'y',
				},
			}).text(),
		).toBe(
			'z.string().transform((str, ctx) => { try { return JSON.parse(str); } catch (err) { ctx.addIssue({ code: "custom", message: "Invalid JSON" }); }}, "x").pipe(z.object({ "name": z.string(), "age": z.number().int() }), "y")',
		);
	});

	it('should accept errorMessage', () => {
		expect(
			parseString({
				type: 'string',
				format: 'ipv4',
				pattern: 'x',
				minLength: 1,
				maxLength: 2,
				errorMessage: {
					format: 'ayy',
					pattern: 'lmao',
					minLength: 'deez',
					maxLength: 'nuts',
				},
			}).text(),
		).toBe(
			'z.string().ip({ version: "v4", message: "ayy" }).regex(new RegExp("x"), "lmao").min(1, "deez").max(2, "nuts")',
		);
	});
});
