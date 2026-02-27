import type { z, ZodFile } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * FileBuilder: represents z.file()
 * Validates file uploads
 */
export class FileBuilder
	extends ZodBuilder<ZodFile, 'file', [params?: Parameters<typeof z.file>[0]]>
	implements BuilderFor<ZodFile>
{
	readonly typeKind = 'file' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.file>[0]) {
		super(version, params);
	}

	mime(
		_types: string | string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('Method not implemented.');
	}
	min(_size: number, _params?: string | Record<string, unknown>): this {
		throw new Error('Method not implemented.');
	}
	max(_size: number, _params?: string | Record<string, unknown>): this {
		throw new Error('Method not implemented.');
	}
}
