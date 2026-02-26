import type { ZodString } from 'zod';
import type { Builder, BuilderFor, ParamsFor } from '../Builder/index.js';
import { StringBuilderBase } from './StringFormatBuilder.js';

/**
 * Fluent StringBuilder: wraps a Zod string schema string and provides chainable methods.
 * Extends StringBuilderBase for shared string methods; adds format-dispatch methods
 * that return format-specific builders in v4 mode (e.g. email() → EmailBuilder).
 */
export class StringBuilder
	extends StringBuilderBase<ZodString, 'string', ParamsFor<'string'>>
	implements BuilderFor<ZodString>
{
	readonly typeKind = 'string';

	constructor(version: 'v3' | 'v4' = 'v4', ...params: ParamsFor<'string'>) {
		super(version, ...params);
	}

	/**
	 * Apply email format.
	 * In v4 mode without constraints, returns EmailBuilder for top-level z.email().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	email(params?: Parameters<ZodString['email']>[0]): this {
		this._format = { format: 'email', params };
		return this;
	}

	/**
	 * Apply uuid format.
	 * In v4 mode without constraints, returns UuidBuilder for top-level z.uuid().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	uuid(params?: Parameters<ZodString['uuid']>[0]): this {
		this._format = { format: 'uuid', params };
		return this;
	}

	/**
	 * Apply url format.
	 * In v4 mode without constraints, returns UrlBuilder for top-level z.url().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	url(params?: Parameters<ZodString['url']>[0]): this {
		this._format = { format: 'url', params };
		return this;
	}

	/**
	 * Apply http/https URL format.
	 */
	httpUrl(params?: unknown): this {
		this._format = { format: 'httpUrl', params };
		return this;
	}

	/**
	 * Apply hostname format.
	 */
	hostname(params?: unknown): this {
		this._format = { format: 'hostname', params };
		return this;
	}

	/**
	 * Apply emoji format (single emoji character).
	 * In v4 mode without constraints, returns EmojiBuilder for top-level z.emoji().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	emoji(params?: Parameters<ZodString['emoji']>[0]): this {
		this._format = { format: 'emoji', params };
		return this;
	}

	/**
	 * Apply base64url format.
	 */
	base64url(params?: Parameters<ZodString['base64url']>[0]): this {
		this._format = { format: 'base64url', params };
		return this;
	}

	/**
	 * Apply hex format.
	 */
	hex(params?: unknown): this {
		this._format = { format: 'hex', params };
		return this;
	}

	/**
	 * Apply JWT format.
	 */
	jwt(params?: Parameters<ZodString['jwt']>[0]): this {
		this._format = { format: 'jwt', params };
		return this;
	}

	/**
	 * Apply nanoid format.
	 * In v4 mode without constraints, returns NanoidBuilder for top-level z.nanoid().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	nanoid(params?: Parameters<ZodString['nanoid']>[0]): this {
		this._format = { format: 'nanoid', params };
		return this;
	}

	/**
	 * Apply cuid format.
	 * In v4 mode without constraints, returns CuidBuilder for top-level z.cuid().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	cuid(params?: Parameters<ZodString['cuid']>[0]): this {
		this._format = { format: 'cuid', params };
		return this;
	}

	/**
	 * Apply cuid2 format.
	 * In v4 mode without constraints, returns CuidBuilder for top-level z.cuid2().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	cuid2(params?: Parameters<ZodString['cuid2']>[0]): this {
		this._format = { format: 'cuid2', params };
		return this;
	}

	/**
	 * Apply ulid format.
	 * In v4 mode without constraints, returns UlidBuilder for top-level z.ulid().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	ulid(params?: Parameters<ZodString['ulid']>[0]): this {
		this._format = { format: 'ulid', params };
		return this;
	}

	/**
	 * Apply IPv4 format.
	 * In v4 mode without constraints, returns IpBuilder for top-level z.ipv4().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	ipv4(params?: unknown): this {
		this._format = { format: 'ipv4', params };
		return this;
	}

	/**
	 * Apply IPv6 format.
	 * In v4 mode without constraints, returns IpBuilder for top-level z.ipv6().
	 * In v3 mode or with constraints, stays in StringBuilder chain.
	 */
	ipv6(params?: unknown): this {
		this._format = { format: 'ipv6', params };
		return this;
	}

	/**
	 * Apply MAC address format.
	 */
	mac(params?: unknown): this {
		this._format = { format: 'mac', params };
		return this;
	}

	/**
	 * Apply IPv4 CIDR block format.
	 */
	cidrv4(params?: Parameters<ZodString['cidrv4']>[0]): this {
		this._format = { format: 'cidrv4', params };
		return this;
	}

	/**
	 * Apply IPv6 CIDR block format.
	 */
	cidrv6(params?: Parameters<ZodString['cidrv6']>[0]): this {
		this._format = { format: 'cidrv6', params };
		return this;
	}

	/**
	 * Apply hash format with algorithm.
	 */
	hash(
		algorithm: 'sha256' | 'sha1' | 'sha384' | 'sha512' | 'md5',
		params?: unknown,
	): this {
		this._format = { format: `hash:${algorithm}`, params };
		return this;
	}

	/**
	 * Apply ISO date format.
	 * Note: In Zod v4, maps to z.date() for ISO 8601 date strings.
	 */
	isoDate(params?: Parameters<ZodString['date']>[0]): this {
		this._format = { format: 'iso.date', params };
		return this;
	}

	/**
	 * Apply ISO time format.
	 * Note: In Zod v4, maps to z.time() for ISO 8601 time strings.
	 */
	isoTime(params?: Parameters<ZodString['time']>[0]): this {
		this._format = { format: 'iso.time', params };
		return this;
	}

	/**
	 * Apply ISO datetime format.
	 * Note: In Zod v4, maps to z.datetime() for ISO 8601 datetime strings.
	 */
	isoDatetime(params?: Parameters<ZodString['datetime']>[0]): this {
		this._format = { format: 'iso.datetime', params };
		return this;
	}

	/**
	 * Apply ISO duration format.
	 * Note: In Zod v4, maps to z.duration() for ISO 8601 duration strings.
	 */
	isoDuration(params?: Parameters<ZodString['duration']>[0]): this {
		this._format = { format: 'iso.duration', params };
		return this;
	}

	/**
	 * Apply UUIDv4 format.
	 */
	uuidv4(params?: Parameters<ZodString['uuid']>[0]): this {
		this._format = { format: 'uuidv4', params };
		return this;
	}

	/**
	 * Apply UUIDv6 format.
	 */
	uuidv6(params?: Parameters<ZodString['uuid']>[0]): this {
		this._format = { format: 'uuidv6', params };
		return this;
	}

	/**
	 * Apply UUIDv7 format.
	 */
	uuidv7(params?: Parameters<ZodString['uuid']>[0]): this {
		this._format = { format: 'uuidv7', params };
		return this;
	}

	/**
	 * Apply base64 encoding constraint.
	 * In v4 mode without other constraints, returns Base64Builder for top-level z.base64().
	 * In v3 mode or with other constraints, stays in StringBuilder chain.
	 */
	base64(params?: Parameters<ZodString['base64']>[0]): this {
		this._base64 = { params };
		return this;
	}

	/**
	 * Compute the base string schema.
	 */
	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.string(${paramsStr})` : 'z.string()';
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this.isV4()) {
			const hasStringParams =
				this._params !== undefined && this._params.length > 0;
			const hasOtherConstraints =
				this._pattern !== undefined ||
				this._minLength !== undefined ||
				this._maxLength !== undefined ||
				this._json !== undefined ||
				this._pipe !== undefined;

			if (
				!hasStringParams &&
				!hasOtherConstraints &&
				this._format !== undefined &&
				this._base64 === undefined
			) {
				const topLevelFormat = buildTopLevelFormat(
					this._format.format,
					this._format.params,
				);
				if (topLevelFormat !== undefined) {
					return super.modify(topLevelFormat);
				}
			}

			if (
				!hasStringParams &&
				!hasOtherConstraints &&
				this._base64 !== undefined &&
				this._format === undefined
			) {
				const base64Params = this._base64.params;
				const base64ParamsStr =
					base64Params === undefined ? '' : JSON.stringify(base64Params);
				const base64TopLevel = base64ParamsStr
					? `z.base64(${base64ParamsStr})`
					: 'z.base64()';
				return super.modify(base64TopLevel);
			}
		}

		if (this._format !== undefined) {
			result = applyFormat(result, this._format.format, this._format.params);
		}
		if (this._pattern !== undefined) {
			result = applyPattern(
				result,
				this._pattern.pattern,
				this._pattern.params,
			);
		}
		if (this._minLength !== undefined) {
			result = applyMinLength(
				result,
				this._minLength.value,
				this._minLength.params,
			);
		}
		if (this._maxLength !== undefined) {
			result = applyMaxLength(
				result,
				this._maxLength.value,
				this._maxLength.params,
			);
		}
		if (this._base64 !== undefined) {
			result = applyBase64(result, this._base64.params);
		}
		if (this._json !== undefined) {
			result = applyJsonTransform(result, this._json.params);
		}
		if (this._pipe !== undefined) {
			result = applyPipe(result, this._pipe.contentSchema, this._pipe.params);
		}

		return super.modify(result);
	}
}

function buildTopLevelFormat(
	format: string,
	params?: unknown,
): string | undefined {
	const paramsStr =
		typeof params === 'string'
			? `{ error: ${JSON.stringify(params)} }`
			: params === undefined
				? ''
				: JSON.stringify(params);
	switch (format) {
		case 'email':
			return paramsStr ? `z.email(${paramsStr})` : 'z.email()';
		case 'url':
			return paramsStr ? `z.url(${paramsStr})` : 'z.url()';
		case 'httpUrl':
			return paramsStr ? `z.httpUrl(${paramsStr})` : 'z.httpUrl()';
		case 'uuid':
			return paramsStr ? `z.uuid(${paramsStr})` : 'z.uuid()';
		case 'emoji':
			return paramsStr ? `z.emoji(${paramsStr})` : 'z.emoji()';
		case 'nanoid':
			return paramsStr ? `z.nanoid(${paramsStr})` : 'z.nanoid()';
		case 'cuid':
			return paramsStr ? `z.cuid(${paramsStr})` : 'z.cuid()';
		case 'cuid2':
			return paramsStr ? `z.cuid2(${paramsStr})` : 'z.cuid2()';
		case 'ulid':
			return paramsStr ? `z.ulid(${paramsStr})` : 'z.ulid()';
		case 'ipv4':
			return paramsStr ? `z.ipv4(${paramsStr})` : 'z.ipv4()';
		case 'ipv6':
			return paramsStr ? `z.ipv6(${paramsStr})` : 'z.ipv6()';
		case 'cidrv4':
			return paramsStr ? `z.cidrv4(${paramsStr})` : 'z.cidrv4()';
		case 'cidrv6':
			return paramsStr ? `z.cidrv6(${paramsStr})` : 'z.cidrv6()';
		default:
			return undefined;
	}
}

/**
 * Apply format constraint to a string schema.
 */
export function applyFormat(
	zodStr: string,
	format: string,
	params?: unknown,
): string {
	const hasParams = params !== undefined;
	const serializedParams = hasParams ? JSON.stringify(params) : '';
	switch (format) {
		case 'email':
			return hasParams
				? `${zodStr}.email(${serializedParams})`
				: `${zodStr}.email()`;
		case 'ip':
			return hasParams ? `${zodStr}.ip(${serializedParams})` : `${zodStr}.ip()`;
		case 'ipv4':
			return hasParams
				? `${zodStr}.ip(${serializedParams})`
				: `${zodStr}.ip({ version: "v4" })`;
		case 'ipv6':
			return hasParams
				? `${zodStr}.ip(${serializedParams})`
				: `${zodStr}.ip({ version: "v6" })`;
		case 'uri':
		case 'url':
			return hasParams
				? `${zodStr}.url(${serializedParams})`
				: `${zodStr}.url()`;
		case 'httpUrl':
			return hasParams
				? `${zodStr}.httpUrl(${serializedParams})`
				: `${zodStr}.httpUrl()`;
		case 'hostname':
			return hasParams
				? `${zodStr}.hostname(${serializedParams})`
				: `${zodStr}.hostname()`;
		case 'emoji':
			return hasParams
				? `${zodStr}.emoji(${serializedParams})`
				: `${zodStr}.emoji()`;
		case 'uuid':
			return hasParams
				? `${zodStr}.uuid(${serializedParams})`
				: `${zodStr}.uuid()`;
		case 'uuidv4':
			return hasParams
				? `${zodStr}.uuid(${serializedParams})`
				: `${zodStr}.uuid({ version: "v4" })`;
		case 'uuidv6':
			return hasParams
				? `${zodStr}.uuid(${serializedParams})`
				: `${zodStr}.uuid({ version: "v6" })`;
		case 'uuidv7':
			return hasParams
				? `${zodStr}.uuid(${serializedParams})`
				: `${zodStr}.uuid({ version: "v7" })`;
		case 'base64url':
			return hasParams
				? `${zodStr}.base64url(${serializedParams})`
				: `${zodStr}.base64url()`;
		case 'hex':
			return hasParams
				? `${zodStr}.hex(${serializedParams})`
				: `${zodStr}.hex()`;
		case 'jwt':
			return hasParams
				? `${zodStr}.jwt(${serializedParams})`
				: `${zodStr}.jwt()`;
		case 'nanoid':
			return hasParams
				? `${zodStr}.nanoid(${serializedParams})`
				: `${zodStr}.nanoid()`;
		case 'cuid':
			return hasParams
				? `${zodStr}.cuid(${serializedParams})`
				: `${zodStr}.cuid()`;
		case 'cuid2':
			return hasParams
				? `${zodStr}.cuid2(${serializedParams})`
				: `${zodStr}.cuid2()`;
		case 'ulid':
			return hasParams
				? `${zodStr}.ulid(${serializedParams})`
				: `${zodStr}.ulid()`;
		case 'mac':
			return hasParams
				? `${zodStr}.mac(${serializedParams})`
				: `${zodStr}.mac()`;
		case 'cidrv4':
			return hasParams
				? `${zodStr}.cidrv4(${serializedParams})`
				: `${zodStr}.cidrv4()`;
		case 'cidrv6':
			return hasParams
				? `${zodStr}.cidrv6(${serializedParams})`
				: `${zodStr}.cidrv6()`;
		case 'iso.date':
			return hasParams
				? `${zodStr}.iso.date(${serializedParams})`
				: `${zodStr}.iso.date()`;
		case 'iso.time':
			return hasParams
				? `${zodStr}.iso.time(${serializedParams})`
				: `${zodStr}.iso.time()`;
		case 'iso.datetime':
			return hasParams
				? `${zodStr}.iso.datetime(${serializedParams})`
				: `${zodStr}.iso.datetime()`;
		case 'iso.duration':
			return hasParams
				? `${zodStr}.iso.duration(${serializedParams})`
				: `${zodStr}.iso.duration()`;
		case 'date-time':
			return hasParams
				? `${zodStr}.datetime(${serializedParams})`
				: `${zodStr}.datetime({ offset: true })`;
		case 'time':
			return hasParams
				? `${zodStr}.time(${serializedParams})`
				: `${zodStr}.time()`;
		case 'date':
			return hasParams
				? `${zodStr}.date(${serializedParams})`
				: `${zodStr}.date()`;
		case 'binary':
			return hasParams
				? `${zodStr}.base64(${serializedParams})`
				: `${zodStr}.base64()`;
		case 'duration':
			return hasParams
				? `${zodStr}.duration(${serializedParams})`
				: `${zodStr}.duration()`;
		default:
			// Handle hash formats
			if (format.startsWith('hash:')) {
				const algorithm = format.substring(5);
				return hasParams
					? `${zodStr}.hash(${JSON.stringify(algorithm)}, ${serializedParams})`
					: `${zodStr}.hash(${JSON.stringify(algorithm)})`;
			}
			return zodStr;
	}
}

/**
 * Apply regex pattern constraint to a string schema.
 */
export function applyPattern(
	zodStr: string,
	pattern: string,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.regex(new RegExp(${JSON.stringify(pattern)}), ${JSON.stringify(params)})`
		: `${zodStr}.regex(new RegExp(${JSON.stringify(pattern)}))`;
}

/**
 * Apply minLength constraint to a string schema.
 */
export function applyMinLength(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.min(${JSON.stringify(value)}, ${JSON.stringify(params)})`
		: `${zodStr}.min(${JSON.stringify(value)})`;
}

/**
 * Apply maxLength constraint to a string schema.
 */
export function applyMaxLength(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.max(${JSON.stringify(value)}, ${JSON.stringify(params)})`
		: `${zodStr}.max(${JSON.stringify(value)})`;
}

/**
 * Apply base64 encoding constraint to a string schema.
 */
export function applyBase64(zodStr: string, params?: unknown): string {
	return params !== undefined
		? `${zodStr}.base64(${JSON.stringify(params)})`
		: `${zodStr}.base64()`;
}

/**
 * Apply JSON transform to a string schema.
 * Note: The transform function always uses "Invalid JSON" as the internal error message.
 * The errorMessage parameter becomes the second argument to .transform() for Zod's error handling.
 */
export function applyJsonTransform(zodStr: string, params?: unknown): string {
	const transformPart = `(str, ctx) => { try { return JSON.parse(str); } catch (err) { ctx.addIssue({ code: "custom", message: "Invalid JSON" }); }}`;

	if (params !== undefined) {
		return `${zodStr}.transform(${transformPart}, ${JSON.stringify(params)})`;
	}
	return `${zodStr}.transform(${transformPart})`;
}

/**
 * Apply pipe with parsed content schema.
 */
export function applyPipe(
	zodStr: string,
	contentSchemaZod: Builder,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.pipe(${contentSchemaZod.text()}, ${JSON.stringify(params)})`
		: `${zodStr}.pipe(${contentSchemaZod.text()})`;
}
