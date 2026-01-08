import { parseDefault } from './parseDefault.js';
import { parseMultipleType } from './parseMultipleType.js';
import { parseNot } from './parseNot.js';
import { parseConst } from './parseConst.js';
import { parseEnum } from './parseEnum.js';
import { parseIfThenElse } from './parseIfThenElse.js';
import { parseNullable } from './parseNullable.js';
import {
	ParserSelector,
	Context,
	JsonSchemaObject,
	JsonSchema,
} from '../../Types.js';
import { BaseBuilder } from '../../ZodBuilder/index.js';
import { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { its } from '../its.js';
import { buildV4 } from '../../ZodBuilder/v4.js';
import { selectParserClass } from './registry.js';
import { is } from '../../utils/is.js';
import { BaseParser } from './BaseParser.js';
import { matchPath as matchPattern } from '../../PostProcessing/pathMatcher.js';

export const parseSchema = (
	schema: JsonSchema,
	refs: Context = {
		seen: new Map(),
		path: [],
		pathString: '$',
		matchPath: (pattern: string) => matchPattern([], pattern),
		build: buildV4,
	},
	blockMeta?: boolean,
): ZodBuilder => {
	const path = refs.path || [];
	const pathString = refs.pathString ?? (path.length ? `$.${path.join('.')}` : '$');
	const matchPath = refs.matchPath ?? ((pattern: string) => matchPattern(path, pattern));

	if (typeof schema !== 'object')
		return schema ? refs.build.any() : refs.build.never();

	if (refs.preprocessors) {
		for (const preprocessor of refs.preprocessors) {
			const output = preprocessor(schema as JsonSchemaObject, refs);
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
};

const addDescribes = (
	schema: JsonSchemaObject,
	builder: BaseBuilder,
): BaseBuilder => {
	if (schema.description) {
		return builder.describe(schema.description);
	}

	return builder;
};

const addDefaults = (
	schema: JsonSchemaObject,
	builder: BaseBuilder,
): BaseBuilder => {
	if (schema.default !== undefined) {
		return builder.default(schema.default);
	}

	return builder;
};

const addAnnotations = (
	schema: JsonSchemaObject,
	builder: BaseBuilder,
): BaseBuilder => {
	if (schema.readOnly) {
		return builder.readonly();
	}

	return builder;
};

const selectParser: ParserSelector = (schema, refs) => {
	// Check for special cases FIRST (nullable, not, enum, const, etc)
	// These can wrap other types
	if (its.a.nullable(schema)) {
		return parseNullable(schema, refs);
	} else if (its.a.not(schema)) {
		return parseNot(schema, refs);
	} else if (its.an.enum(schema)) {
		return parseEnum(schema, refs); //<-- needs to come before primitives
	} else if (its.a.const(schema)) {
		return parseConst(schema, refs);
	} else if (its.a.multipleType(schema)) {
		return parseMultipleType(schema, refs);
	} else if (its.a.conditional(schema)) {
		return parseIfThenElse(schema, refs);
	}

	// Try registry-based parser classes (for converted parsers)
	const ParserClass = selectParserClass(schema);
	if (ParserClass) {
		const parser = new ParserClass(schema as any, refs);
		return parser.parse();
	}

	// Default fallback
	return parseDefault(schema, refs);
};

// Initialize BaseParser with parseSchema reference to break circular dependency
BaseParser.setParseSchema(parseSchema);
