import type { ZodFile } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * FileBuilder: represents z.file()
 * Validates file uploads
 */
export class FileBuilder
	extends ZodBuilder<ZodFile>
	implements BuilderFor<ZodFile>
{
	readonly typeKind = 'file' as const;

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
