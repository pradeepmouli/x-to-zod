import { ZodBuilder } from './BaseBuilder.js';

/**
 * FileBuilder: represents z.file()
 * Validates file uploads
 */
export class FileBuilder extends ZodBuilder<'file'> {
	readonly typeKind = 'file' as const;

	protected override base(): string {
		return 'z.file()';
	}
}
