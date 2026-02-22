import type { ParserConstructor } from '../Parser/index.js';
import type { Context } from '../Types.js';
import type { SchemaInputAdapter, SchemaMetadata } from './index.js';
import { _setDefaultAdapter } from './index.js';
import {
	isJSONSchema,
	type JSONSchemaObject,
} from '../JsonSchema/types/index.js';
import { selectParserClass } from '../JsonSchema/parsers/registry.js';

export class JsonSchemaAdapter implements SchemaInputAdapter {
	isValid(input: unknown): boolean {
		return isJSONSchema(input as any);
	}

	selectParser(input: unknown, _refs: Context): ParserConstructor | undefined {
		return selectParserClass(input as any);
	}

	getRef(input: unknown): string | undefined {
		if (typeof input === 'object' && input !== null) {
			const ref = (input as Record<string, unknown>).$ref;
			if (typeof ref === 'string') {
				return ref;
			}
		}
		return undefined;
	}

	getMetadata(input: unknown): SchemaMetadata {
		if (typeof input !== 'object' || input === null) {
			return {};
		}
		const s = input as JSONSchemaObject & Record<string, unknown>;
		const meta: SchemaMetadata = {};
		if (typeof s.description === 'string') {
			meta.description = s.description;
		}
		if (
			Object.prototype.hasOwnProperty.call(s, 'default') &&
			s.default !== undefined
		) {
			meta.default = s.default;
		}
		if (s.readOnly === true) {
			meta.readOnly = true;
		}
		return meta;
	}
}

export const jsonSchemaAdapter = new JsonSchemaAdapter();

// Auto-register as the default adapter (only if none already set)
_setDefaultAdapter(jsonSchemaAdapter);
