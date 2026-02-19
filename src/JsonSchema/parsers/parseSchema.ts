import { parseDefault } from './parseDefault.js';
import { ParserSelector, Context } from '../../Types.js';
import {
	isJSONSchema,
	type JSONSchemaAny as JSONSchema,
	type SchemaVersion,
} from '../types/index.js';
import { BaseBuilder } from '../../ZodBuilder/index.js';
import { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { buildV4 } from '../../ZodBuilder/v4.js';
import { selectParserClass } from './registry.js';
import { is } from '../../utils/is.js';
import { BaseParser } from './BaseParser.js';
import { matchPath as matchPattern } from '../../PostProcessing/pathMatcher.js';
import { parseRef } from '../../SchemaProject/parseRef.js';

export const parseSchema = <Version extends SchemaVersion>(
	schema: JSONSchema<Version>,
	refs: Context = {
		seen: new Map(),
		path: [],
		matchPath: (pattern: string) => matchPattern([], pattern),
		build: buildV4,
	},
	blockMeta?: boolean,
): ZodBuilder => {
	if (isJSONSchema(schema)) {
		const path = refs.path || [];
		// Always compute pathString from path, don't use cached value when path changes
		const pathString = path.length ? `$.${path.join('.')}` : '$';
		// Always recompute matchPath when path changes
		const matchPath = (pattern: string) => matchPattern(path, pattern);

		// Phase 3: Handle top-level $ref via SchemaProject parseRef when available
		// This delegates external reference handling to ReferenceBuilder.
		if (refs.refResolver && schema.$ref && typeof schema.$ref === 'string') {
			const refBuilder = parseRef(
				schema,
				refs.refResolver,
				refs.currentSchemaId || '',
				refs.dependencyGraph,
			);
			if (refBuilder) {
				return refBuilder;
			}
			// For internal refs (#...), fall through to normal parsing.
		}

		if (refs.preprocessors) {
			for (const preprocessor of refs.preprocessors) {
				const output: any = preprocessor(schema, refs);
				if (output) schema = output;
			}
		}
		if (refs.parserOverride) {
			const custom = refs.parserOverride(schema, refs);

			if (typeof custom === 'string') {
				return refs.build.code(custom);
			}

			if (is.zodBuilder(custom)) {
				return custom;
			}
		}

		let seen = refs.seen.get(schema);

		if (seen) {
			if (seen.r !== undefined) {
				return seen.r;
			}

			if (refs.depth === undefined || seen.n >= refs.depth) {
				return refs.build.any();
			}

			seen.n += 1;
		} else {
			seen = { r: undefined, n: 0 };
			refs.seen.set(schema, seen);
		}

		let parsed = selectParser(schema, {
			...refs,
			path,
			pathString,
			matchPath,
		});
		if (!blockMeta) {
			if (!refs.withoutDescribes) {
				parsed = addDescribes(schema, parsed);
			}

			if (!refs.withoutDefaults) {
				parsed = addDefaults(schema, parsed);
			}

			parsed = addAnnotations(schema, parsed);
		}

		seen.r = parsed;

		return parsed;
	} else {
		// Non-object schemas (e.g., boolean) are not valid JSON Schemas, but we can still handle them.
		return schema ? refs.build.any() : refs.build.never();
	}
};

const addDescribes = (
	schema: JSONSchema,
	builder: BaseBuilder,
): BaseBuilder => {
	const schemaObject = schema as any;
	if (schemaObject.description) {
		return builder.describe(schemaObject.description);
	}

	return builder;
};

const addDefaults = (schema: JSONSchema, builder: BaseBuilder): BaseBuilder => {
	const schemaObject = schema as any;
	if (schemaObject.default !== undefined) {
		return builder.default(schemaObject.default);
	}

	return builder;
};

const addAnnotations = (
	schema: JSONSchema,
	builder: BaseBuilder,
): BaseBuilder => {
	const schemaObject = schema as any;
	if (schemaObject.readOnly) {
		return builder.readonly();
	}

	return builder;
};

const selectParser: ParserSelector = (schema, refs) => {
	if (!isJSONSchema(schema)) {
		return schema ? refs.build.any() : refs.build.never();
	}
	// Try registry-based parser classes (handles all types including special cases)
	const ParserClass = selectParserClass(schema);
	if (ParserClass) {
		const parser = new (ParserClass as any)(schema, refs);
		return parser.parse();
	}

	// Default fallback
	return parseDefault(schema, refs);
};

// Initialize BaseParser with parseSchema reference to break circular dependency
BaseParser.setParseSchema(parseSchema);
