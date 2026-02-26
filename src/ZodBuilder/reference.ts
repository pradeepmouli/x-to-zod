import type { Builder } from '../Builder/index.js';
import type { ImportInfo } from '../SchemaProject/types.js';

/**
 * ReferenceBuilder represents a reference to an external schema in a multi-schema project.
 * It is used when a $ref points to another schema file and generates the appropriate
 * import and reference code.
 *
 * This is a standalone class (not a ZodBuilder subclass) because references are
 * structural pointers, not Zod schema constructors — they don't map to a z.xxx() call.
 */
export class ReferenceBuilder implements Builder {
	readonly typeKind = 'lazy' as const;

	readonly targetImportName: string;
	readonly targetExportName: string;
	readonly importInfo: ImportInfo;
	readonly isLazy: boolean;
	readonly isTypeOnly: boolean;
	readonly unknownFallback: boolean;
	readonly shouldEmitImport: boolean;

	// Modifier state
	_optional = false;
	_nullable = false;
	_readonly = false;
	_defaultValue?: unknown = undefined;
	_describeText?: string = undefined;
	_brandText?: string = undefined;
	_fallbackText?: unknown = undefined;
	_refineFn?: string = undefined;
	_refineMessage?: string = undefined;
	_superRefineFns: string[] = [];
	_metaData?: Record<string, unknown> = undefined;
	_transformFn?: string = undefined;

	constructor(
		targetImportName: string,
		targetExportName: string,
		importInfo: ImportInfo,
		options?: {
			isLazy?: boolean;
			isTypeOnly?: boolean;
			unknownFallback?: boolean;
		},
	) {
		this.targetImportName = targetImportName;
		this.targetExportName = targetExportName;
		this.importInfo = importInfo;
		this.isLazy = !!options?.isLazy;
		this.isTypeOnly = !!options?.isTypeOnly;
		this.unknownFallback = !!options?.unknownFallback;
		this.shouldEmitImport = !this.unknownFallback && !!importInfo.modulePath;
	}

	// --- Builder interface methods ---

	optional(): this {
		this._optional = true;
		return this;
	}
	nullable(): this {
		this._nullable = true;
		return this;
	}
	default(value: unknown): this {
		this._defaultValue = value;
		return this;
	}
	describe(description: string): this {
		this._describeText = description;
		return this;
	}
	brand(brand: string): this {
		this._brandText = brand;
		return this;
	}
	readonly(): this {
		this._readonly = true;
		return this;
	}
	catch(value: unknown): this {
		this._fallbackText = value;
		return this;
	}
	refine(refineFn: string, message?: string): this {
		this._refineFn = refineFn;
		this._refineMessage = message;
		return this;
	}
	superRefine(superRefineFn: string): this {
		this._superRefineFns.push(superRefineFn);
		return this;
	}
	meta(metadata: Record<string, unknown>): this {
		this._metaData = metadata;
		return this;
	}
	transform(transformFn: string): this {
		this._transformFn = transformFn;
		return this;
	}

	/**
	 * Generate the Zod code for the reference.
	 * For lazy references, wraps in z.lazy(() => ...)
	 * For normal references, returns the import directly.
	 */
	private base(): string {
		if (this.unknownFallback) {
			return 'z.unknown()';
		}

		const importRef = `${this.targetImportName}.${this.targetExportName}`;

		if (this.isLazy) {
			return `z.lazy(() => ${importRef})`;
		}

		return importRef;
	}

	/**
	 * Emit the final Zod expression as a TypeScript code string.
	 */
	text(): string {
		let result = this.base();
		result = this.applyModifiers(result);
		return result;
	}

	getImportInfo(): ImportInfo | null {
		if (!this.shouldEmitImport) return null;
		return this.importInfo;
	}

	/**
	 * Apply modifiers to the reference string.
	 */
	private applyModifiers(zodStr: string): string {
		if (this._optional) {
			zodStr = `${zodStr}.optional()`;
		}
		if (this._nullable) {
			zodStr = `${zodStr}.nullable()`;
		}
		if (this._readonly) {
			zodStr = `${zodStr}.readonly()`;
		}
		if (this._defaultValue !== undefined) {
			zodStr = `${zodStr}.default(${JSON.stringify(this._defaultValue)})`;
		}
		if (this._describeText) {
			zodStr = `${zodStr}.describe(${JSON.stringify(this._describeText)})`;
		}
		if (this._brandText) {
			zodStr = `${zodStr}.brand(${JSON.stringify(this._brandText)})`;
		}
		if (this._fallbackText !== undefined) {
			zodStr = `${zodStr}.catch(${JSON.stringify(this._fallbackText)})`;
		}
		if (this._refineFn) {
			zodStr = this._refineMessage
				? `${zodStr}.refine(${this._refineFn}, ${JSON.stringify(this._refineMessage)})`
				: `${zodStr}.refine(${this._refineFn})`;
		}
		for (const fn of this._superRefineFns) {
			zodStr = `${zodStr}.superRefine(${fn})`;
		}
		if (this._metaData) {
			zodStr = `${zodStr}.meta(${JSON.stringify(this._metaData)})`;
		}
		if (this._transformFn) {
			zodStr = `${zodStr}.transform(${this._transformFn})`;
		}
		return zodStr;
	}
}
