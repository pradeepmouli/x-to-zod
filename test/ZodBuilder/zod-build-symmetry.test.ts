import { describe, expect, it } from 'vitest';
import { buildV4 } from '../../src/ZodBuilder/v4.js';

// Reusable sub-schemas for complex constructors
const str = buildV4.string();
const num = buildV4.number();
const obj = buildV4.object({ a: buildV4.string() });

describe('buildV4 / z.* output symmetry', () => {
	describe('primitives — with error param', () => {
		it('string', () =>
			expect(buildV4.string({ error: 'x' }).text()).toBe(
				'z.string({"error":"x"})',
			));
		it('number', () =>
			expect(buildV4.number({ error: 'x' }).text()).toBe(
				'z.number({"error":"x"})',
			));
		it('boolean', () =>
			expect(buildV4.boolean({ error: 'x' }).text()).toBe(
				'z.boolean({"error":"x"})',
			));
		it('bigint', () =>
			expect(buildV4.bigint({ error: 'x' }).text()).toBe(
				'z.bigint({"error":"x"})',
			));
		it('date', () =>
			expect(buildV4.date({ error: 'x' }).text()).toBe(
				'z.date({"error":"x"})',
			));
	});

	describe('meta-types — parameterless in Zod', () => {
		it('symbol', () => expect(buildV4.symbol().text()).toBe('z.symbol()'));
		it('null', () => expect(buildV4.null().text()).toBe('z.null()'));
		it('undefined', () =>
			expect(buildV4.undefined().text()).toBe('z.undefined()'));
		it('void', () => expect(buildV4.void().text()).toBe('z.void()'));
		it('any', () => expect(buildV4.any().text()).toBe('z.any()'));
		it('unknown', () => expect(buildV4.unknown().text()).toBe('z.unknown()'));
		it('never', () => expect(buildV4.never().text()).toBe('z.never()'));
		it('nan', () => expect(buildV4.nan().text()).toBe('z.nan()'));
	});

	describe('string format constructors — with error param', () => {
		it('email', () =>
			expect(buildV4.email({ error: 'x' }).text()).toBe(
				'z.email({"error":"x"})',
			));
		it('url', () =>
			expect(buildV4.url({ error: 'x' }).text()).toBe('z.url({"error":"x"})'));
		it('httpUrl', () =>
			expect(buildV4.httpUrl({ error: 'x' }).text()).toBe(
				'z.httpUrl({"error":"x"})',
			));
		it('uuid', () =>
			expect(buildV4.uuid({ error: 'x' }).text()).toBe(
				'z.uuid({"error":"x"})',
			));
		it('uuidv4', () =>
			expect(buildV4.uuidv4({ error: 'x' }).text()).toBe(
				'z.uuid({"error":"x"})',
			));
		it('uuidv6', () =>
			expect(buildV4.uuidv6({ error: 'x' }).text()).toBe(
				'z.uuid({"error":"x"})',
			));
		it('uuidv7', () =>
			expect(buildV4.uuidv7({ error: 'x' }).text()).toBe(
				'z.uuid({"error":"x"})',
			));
		it('guid', () =>
			expect(buildV4.guid({ error: 'x' }).text()).toBe(
				'z.guid({"error":"x"})',
			));
		it('emoji', () =>
			expect(buildV4.emoji({ error: 'x' }).text()).toBe(
				'z.emoji({"error":"x"})',
			));
		it('nanoid', () =>
			expect(buildV4.nanoid({ error: 'x' }).text()).toBe(
				'z.nanoid({"error":"x"})',
			));
		it('cuid', () =>
			expect(buildV4.cuid({ error: 'x' }).text()).toBe(
				'z.cuid({"error":"x"})',
			));
		it('cuid2', () =>
			expect(buildV4.cuid2({ error: 'x' }).text()).toBe(
				'z.cuid2({"error":"x"})',
			));
		it('ulid', () =>
			expect(buildV4.ulid({ error: 'x' }).text()).toBe(
				'z.ulid({"error":"x"})',
			));
		it('xid', () =>
			expect(buildV4.xid({ error: 'x' }).text()).toBe('z.xid({"error":"x"})'));
		it('ksuid', () =>
			expect(buildV4.ksuid({ error: 'x' }).text()).toBe(
				'z.ksuid({"error":"x"})',
			));
		it('e164', () =>
			expect(buildV4.e164({ error: 'x' }).text()).toBe(
				'z.e164({"error":"x"})',
			));
		it('base64', () =>
			expect(buildV4.base64({ error: 'x' }).text()).toBe(
				'z.base64({"error":"x"})',
			));
		it('base64url', () =>
			expect(buildV4.base64url({ error: 'x' }).text()).toBe(
				'z.base64url({"error":"x"})',
			));
		it('ipv4', () =>
			expect(buildV4.ipv4({ error: 'x' }).text()).toBe(
				'z.ipv4({"error":"x"})',
			));
		it('ipv6', () =>
			expect(buildV4.ipv6({ error: 'x' }).text()).toBe(
				'z.ipv6({"error":"x"})',
			));
		it('cidrv4', () =>
			expect(buildV4.cidrv4({ error: 'x' }).text()).toBe(
				'z.cidrv4({"error":"x"})',
			));
		it('cidrv6', () =>
			expect(buildV4.cidrv6({ error: 'x' }).text()).toBe(
				'z.cidrv6({"error":"x"})',
			));
		it('jwt', () =>
			expect(buildV4.jwt({ error: 'x' }).text()).toBe('z.jwt({"error":"x"})'));
		it('mac', () =>
			expect(buildV4.mac({ error: 'x' }).text()).toBe('z.mac({"error":"x"})'));
		it('hostname', () =>
			expect(buildV4.hostname({ error: 'x' }).text()).toBe(
				'z.hostname({"error":"x"})',
			));
		it('hex', () =>
			expect(buildV4.hex({ error: 'x' }).text()).toBe('z.hex({"error":"x"})'));
		it('hash', () =>
			expect(buildV4.hash('sha256').text()).toBe('z.hash("sha256")'));
		it('stringFormat', () =>
			expect(buildV4.stringFormat('myFmt', '(v) => true').text()).toBe(
				'z.stringFormat("myFmt", (v) => true)',
			));
		it('stringbool', () =>
			expect(buildV4.stringbool({ error: 'x' }).text()).toBe(
				'z.stringbool({"error":"x"})',
			));
	});

	describe('number / bigint format constructors — with error param', () => {
		it('int', () =>
			expect(buildV4.int({ error: 'x' }).text()).toBe('z.int({"error":"x"})'));
		it('float32', () =>
			expect(buildV4.float32({ error: 'x' }).text()).toBe(
				'z.float32({"error":"x"})',
			));
		it('float64', () =>
			expect(buildV4.float64({ error: 'x' }).text()).toBe(
				'z.float64({"error":"x"})',
			));
		it('int32', () =>
			expect(buildV4.int32({ error: 'x' }).text()).toBe(
				'z.int32({"error":"x"})',
			));
		it('uint32', () =>
			expect(buildV4.uint32({ error: 'x' }).text()).toBe(
				'z.uint32({"error":"x"})',
			));
		it('int64', () =>
			expect(buildV4.int64({ error: 'x' }).text()).toBe(
				'z.int64({"error":"x"})',
			));
		it('uint64', () =>
			expect(buildV4.uint64({ error: 'x' }).text()).toBe(
				'z.uint64({"error":"x"})',
			));
	});

	describe('collection constructors', () => {
		it('array', () =>
			expect(buildV4.array(str).text()).toBe('z.array(z.string())'));
		it('array nonempty', () =>
			expect(buildV4.array(str).nonempty().text()).toBe(
				'z.array(z.string()).min(1)',
			));
		it('array nonempty with params', () =>
			expect(buildV4.array(str).nonempty({ error: 'required' }).text()).toBe(
				'z.array(z.string()).min(1, {"error":"required"})',
			));
		it('array length', () =>
			expect(buildV4.array(str).length(3).text()).toBe(
				'z.array(z.string()).length(3)',
			));
		it('array length with params', () =>
			expect(buildV4.array(str).length(3, { error: 'bad length' }).text()).toBe(
				'z.array(z.string()).length(3, {"error":"bad length"})',
			));
		it('array length supersedes min/max', () =>
			expect(buildV4.array(str).min(1).max(5).length(3).text()).toBe(
				'z.array(z.string()).length(3)',
			));
		it('object', () =>
			expect(buildV4.object({ a: str }).text()).toBe(
				'z.object({ "a": z.string() })',
			));
		it('strictObject', () =>
			expect(buildV4.strictObject({ a: str }).text()).toBe(
				'z.strictObject({ "a": z.string() })',
			));
		it('looseObject', () =>
			expect(buildV4.looseObject({ a: str }).text()).toBe(
				'z.looseObject({ "a": z.string() })',
			));
		it('record', () =>
			expect(buildV4.record(str, num).text()).toBe(
				'z.record(z.string(), z.number())',
			));
		it('looseRecord', () =>
			expect(buildV4.looseRecord(str, num).text()).toBe(
				'z.record(z.string(), z.number())',
			));
		it('partialRecord', () =>
			expect(buildV4.partialRecord(str, num).text()).toBe(
				'z.record(z.string(), z.number())',
			));
		it('tuple', () =>
			expect(buildV4.tuple([str]).text()).toBe('z.tuple([z.string()])'));
		it('set', () => expect(buildV4.set(str).text()).toBe('z.set(z.string())'));
		it('map', () =>
			expect(buildV4.map(str, num).text()).toBe(
				'z.map(z.string(), z.number())',
			));
	});

	describe('schema combinators', () => {
		it('enum', () =>
			expect(buildV4.enum(['a', 'b']).text()).toBe('z.enum(["a","b"])'));
		it('nativeEnum', () =>
			expect(buildV4.nativeEnum('MyEnum').text()).toBe('z.enum(MyEnum)'));
		it('literal', () =>
			expect(buildV4.literal('hello').text()).toBe('z.literal("hello")'));
		it('union', () =>
			expect(buildV4.union([str, num]).text()).toBe(
				'z.union([z.string(), z.number()])',
			));
		it('xor', () =>
			expect(buildV4.xor([str, num]).text()).toBe(
				'z.xor([z.string(),z.number()])',
			));
		it('intersection', () =>
			expect(buildV4.intersection(str, num).text()).toBe(
				'z.intersection(z.string(), z.number())',
			));
		it('discriminatedUnion', () =>
			expect(
				buildV4
					.discriminatedUnion('type', [
						buildV4.object({ type: buildV4.literal('a') }),
					])
					.text(),
			).toBe(
				'z.discriminatedUnion("type", [z.object({ "type": z.literal("a") })])',
			));
		it('templateLiteral', () =>
			expect(buildV4.templateLiteral(['hi ', str]).text()).toBe(
				'z.templateLiteral(["hi ",z.string()])',
			));
		it('keyof', () =>
			expect(buildV4.keyof(obj).text()).toBe(
				'z.keyof(z.object({ "a": z.string() }))',
			));
	});

	describe('wrappers & transforms', () => {
		it('promise', () =>
			expect(buildV4.promise(str).text()).toBe('z.promise(z.string())'));
		it('lazy', () =>
			expect(buildV4.lazy(str).text()).toBe('z.lazy(() => z.string())'));
		it('function', () =>
			expect(buildV4.function({ input: [str], output: num }).text()).toBe(
				'z.function().args(z.string()).returns(z.number())',
			));
		it('codec', () =>
			expect(buildV4.codec(str, num).text()).toBe(
				'z.codec(z.string(),z.number())',
			));
		it('preprocess', () =>
			expect(buildV4.preprocess('x => x', str).text()).toBe(
				'z.preprocess(x => x,z.string())',
			));
		it('pipe', () =>
			expect(buildV4.pipe(str, num).text()).toBe(
				'z.string().pipe(z.number())',
			));
		it('json', () =>
			expect(buildV4.json({ error: 'x' }).text()).toBe(
				'z.json({"error":"x"})',
			));
		it('file', () =>
			expect(buildV4.file({ error: 'x' }).text()).toBe(
				'z.file({"error":"x"})',
			));
		it('custom', () =>
			expect(buildV4.custom('(v) => true').text()).toBe(
				'z.custom((v) => true)',
			));
		it('instanceof', () =>
			expect(buildV4.instanceof('MyClass').text()).toBe(
				'z.instanceof(MyClass)',
			));
	});

	describe('app helpers', () => {
		it('literalValue', () =>
			expect(buildV4.literalValue('hello').text()).toBe('z.literal("hello")'));
		it('code', () =>
			expect(buildV4.code('z.string()').text()).toBe('z.string()'));
		it('raw', () =>
			expect(buildV4.raw('z.number()').text()).toBe('z.number()'));
	});

	describe('z.iso.* namespace — with params', () => {
		it('iso.date', () =>
			expect(buildV4.iso.date({ error: 'bad date' }).text()).toBe(
				'z.iso.date({"error":"bad date"})',
			));
		it('iso.time', () =>
			expect(buildV4.iso.time({ error: 'bad time' }).text()).toBe(
				'z.iso.time({"error":"bad time"})',
			));
		it('iso.datetime', () =>
			expect(buildV4.iso.datetime({ offset: true }).text()).toBe(
				'z.iso.datetime({"offset":true})',
			));
		it('iso.duration', () =>
			expect(buildV4.iso.duration({ error: 'bad duration' }).text()).toBe(
				'z.iso.duration({"error":"bad duration"})',
			));
	});
});
