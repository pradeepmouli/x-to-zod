import { describe, it, expect } from 'vitest';
import { ReferenceBuilder } from '../../src/ZodBuilder/reference.js';
import type { ImportInfo } from '../../src/SchemaProject/types.js';

describe('ReferenceBuilder', () => {
	it('generates direct reference for named import', () => {
		const importInfo: ImportInfo = {
			importName: 'UserSchema',
			importKind: 'named',
			modulePath: './user',
			isTypeOnly: false,
		};
		const builder = new ReferenceBuilder(
			'UserSchema',
			'UserSchema',
			importInfo,
		);
		const text = builder.text();
		expect(text).toBe('UserSchema.UserSchema');
		expect(builder.shouldEmitImport).toBe(true);
		expect(builder.getImportInfo()).not.toBeNull();
	});

	it('generates direct reference for default import using default export', () => {
		const importInfo: ImportInfo = {
			importName: 'default',
			importKind: 'default',
			modulePath: './post',
			isTypeOnly: false,
		};
		// For default import, targetExportName should be 'default'
		const builder = new ReferenceBuilder('PostSchema', 'default', importInfo);
		const text = builder.text();
		expect(text).toBe('PostSchema.default');
	});

	it('supports lazy references via getter/lazy fallback', () => {
		const importInfo: ImportInfo = {
			importName: 'CommentSchema',
			importKind: 'named',
			modulePath: './comment',
			isTypeOnly: false,
		};
		const builder = new ReferenceBuilder(
			'CommentSchema',
			'CommentSchema',
			importInfo,
			{ isLazy: true },
		);
		const text = builder.text();
		expect(text).toContain('z.lazy(() => CommentSchema.CommentSchema)');
	});

	it('applies modifiers (optional, nullable, readonly, default, describe, brand)', () => {
		const importInfo: ImportInfo = {
			importName: 'EntitySchema',
			importKind: 'named',
			modulePath: './entity',
			isTypeOnly: true,
		};
		const builder = new ReferenceBuilder(
			'EntitySchema',
			'EntitySchema',
			importInfo,
		)
			.optional()
			.nullable()
			.readonly()
			.default({ a: 1 })
			.describe('Entity ref')
			.brand('EntityBrand');
		const text = builder.text();
		expect(text).toContain('EntitySchema.EntitySchema');
		expect(text).toContain('.optional()');
		expect(text).toContain('.nullable()');
		expect(text).toContain('.readonly()');
		expect(text).toContain('.default({"a":1})');
		expect(text).toContain('.describe("Entity ref")');
		expect(text).toContain('.brand("EntityBrand")');
	});

	it('captures type-only flag without affecting emitted code', () => {
		const importInfo: ImportInfo = {
			importName: 'TypeOnlySchema',
			importKind: 'named',
			modulePath: './type-only',
			isTypeOnly: true,
		};
		const builder = new ReferenceBuilder(
			'TypeOnlySchema',
			'TypeOnlySchema',
			importInfo,
			{ isTypeOnly: true },
		);
		const text = builder.text();
		expect(text).toBe('TypeOnlySchema.TypeOnlySchema');
	});

	it('falls back to z.unknown when flagged', () => {
		const importInfo: ImportInfo = {
			importName: 'MissingSchema',
			importKind: 'named',
			modulePath: './missing',
			isTypeOnly: true,
		};
		const builder = new ReferenceBuilder(
			'MissingSchema',
			'MissingSchema',
			importInfo,
			{ unknownFallback: true },
		);
		expect(builder.text()).toBe('z.unknown()');
		expect(builder.shouldEmitImport).toBe(false);
		expect(builder.getImportInfo()).toBeNull();
	});
});
