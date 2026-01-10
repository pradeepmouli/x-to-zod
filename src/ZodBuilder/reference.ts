import type { ImportInfo } from '../SchemaProject/types.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * ReferenceBuilder represents a reference to an external schema in a multi-schema project.
 * It is used when a $ref points to another schema file and generates the appropriate
 * import and reference code.
 *
 * For circular references, this builder can emit lazy (z.lazy()) builders to break cycles.
 */
export class ReferenceBuilder extends ZodBuilder<'reference'> {
	readonly typeKind = 'reference' as const;
	readonly targetImportName: string;
	readonly targetExportName: string;
	readonly importInfo: ImportInfo;
	readonly isLazy: boolean;
	readonly isTypeOnly: boolean;

	constructor(
		targetImportName: string,
		targetExportName: string,
		importInfo: ImportInfo,
		isLazy: boolean = false,
		isTypeOnly: boolean = false,
	) {
		super();
		this.targetImportName = targetImportName;
		this.targetExportName = targetExportName;
		this.importInfo = importInfo;
		this.isLazy = isLazy;
		this.isTypeOnly = isTypeOnly;
	}

	/**
	 * Generate the Zod code for the reference.
	 * For lazy references, wraps in z.lazy(() => ...)
	 * For normal references, returns the import directly.
	 */
	protected base(): string {
		const importRef = `${this.targetImportName}.${this.targetExportName}`;

		if (this.isLazy) {
			return `z.lazy(() => ${importRef})`;
		}

		return importRef;
	}

	/**
	 * Override text() to include lazy builder wrapping if needed
	 */
	text(): string {
		let result = this.base();
		result = this.applyModifiers(result);
		return result;
	}

	/**
	 * Helper to apply modifiers to the reference
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
		return zodStr;
	}
}
