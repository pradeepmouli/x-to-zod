import type { z, ZodFile } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

export type FileParams = Parameters<typeof z.file>[0];

/**
 * FileBuilder: represents z.file()
 * Validates file uploads
 */
export class FileBuilder
	extends ZodBuilder<ZodFile, 'file', [params?: FileParams]>
	implements BuilderFor<ZodFile>
{
	readonly typeKind = 'file' as const;

	constructor(version?: 'v3' | 'v4', params?: FileParams) {
		super(version, params);
	}

	mime(
		_types: string | string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('FileBuilder.mime() is not implemented yet.');
	}
	min(_size: number, _params?: string | Record<string, unknown>): this {
		throw new Error('FileBuilder.min() is not implemented yet.');
	}
	max(_size: number, _params?: string | Record<string, unknown>): this {
		throw new Error('FileBuilder.max() is not implemented yet.');
	}
}
