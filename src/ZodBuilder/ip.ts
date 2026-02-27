import type { z, ZodIPv4 } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type Ipv4Params = Parameters<typeof z.ipv4>[0];
export type Ipv6Params = Parameters<typeof z.ipv6>[0];
export type Cidrv4Params = Parameters<typeof z.cidrv4>[0];
export type Cidrv6Params = Parameters<typeof z.cidrv6>[0];
export type IpParams = Ipv4Params | Ipv6Params | Cidrv4Params | Cidrv6Params;

/**
 * IpBuilder: represents z.ip(), z.ipv4(), z.ipv6() in Zod v4.
 *
 * In v4, IP validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().ip() method chain.
 *
 * Supports variants: ip (any), ipv4, ipv6, cidrv4, cidrv6
 *
 * @example
 * ```typescript
 * // v4 mode - any IP
 * const ip = new IpBuilder('ip', { zodVersion: 'v4' });
 * ip.text(); // => 'z.ip()'
 *
 * // v4 mode - IPv4 only
 * const ipv4 = new IpBuilder('ipv4', { zodVersion: 'v4' });
 * ipv4.text(); // => 'z.ipv4()'
 *
 * // v4 mode - IPv6 only
 * const ipv6 = new IpBuilder('ipv6', { zodVersion: 'v4' });
 * ipv6.text(); // => 'z.ipv6()'
 * ```
 */
export class IpBuilder
	extends StringFormatBuilder<ZodIPv4, [params?: IpParams]>
	implements BuilderFor<ZodIPv4>
{
	readonly typeKind = 'ipv4' as const;
	private _variant: 'ip' | 'ipv4' | 'ipv6' | 'cidrv4' | 'cidrv6';

	constructor(
		version: 'v3' | 'v4' = 'v4',
		variant: 'ip' | 'ipv4' | 'ipv6' | 'cidrv4' | 'cidrv6' = 'ip',
		params?: IpParams,
	) {
		super(version, params);
		this._variant = variant;
	}

	protected override base(): string {
		const method = this._variant;
		const paramsStr = this.serializeParams();

		// In v4, use z.ip() / z.ipv4() / z.ipv6() top-level functions
		if (this.isV4()) {
			return paramsStr ? `z.${method}(${paramsStr})` : `z.${method}()`;
		}

		// In v3, fall back to string().ip() / string().ipv4() / string().ipv6()
		const firstParam = this._params?.[0];
		const buildVersionedParams = (version: 'v4' | 'v6'): string => {
			if (
				firstParam &&
				typeof firstParam === 'object' &&
				!Array.isArray(firstParam)
			) {
				return JSON.stringify({
					...(firstParam as Record<string, unknown>),
					version,
				});
			}
			return JSON.stringify({ version });
		};

		// For 'ip' variant in v3, need to pass version option
		if (method === 'ip') {
			return paramsStr ? `z.string().ip(${paramsStr})` : 'z.string().ip()';
		}

		// For specific variants (ipv4, ipv6), call the specific method
		if (method === 'ipv4') {
			return `z.string().ip(${buildVersionedParams('v4')})`;
		}
		if (method === 'ipv6') {
			return `z.string().ip(${buildVersionedParams('v6')})`;
		}

		// CIDR variants
		if (method === 'cidrv4') {
			return `z.string().cidr(${buildVersionedParams('v4')})`;
		}
		if (method === 'cidrv6') {
			return `z.string().cidr(${buildVersionedParams('v6')})`;
		}

		return paramsStr ? `z.string().ip(${paramsStr})` : 'z.string().ip()';
	}
}
