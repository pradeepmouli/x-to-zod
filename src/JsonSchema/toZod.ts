import { Options, JsonSchema } from '../Types.js';
import { parseSchema } from './parsers/parseSchema.js';
import { expandJsdocs } from '../utils/jsdocs.js';
import { buildV3 } from '../ZodBuilder/v3.js';
import { buildV4 } from '../ZodBuilder/v4.js';

export const toZod = (
	schema: JsonSchema,
	{ module, name, type, noImport, ...rest }: Options = {},
): string => {
	if (type && (!name || module !== 'esm')) {
		throw new Error(
			'Option `type` requires `name` to be set and `module` to be `esm`',
		);
	}

	// Select build factory based on zodVersion (default: v4)
	const zodVersion = rest.zodVersion ?? 'v4';
	const build = zodVersion === 'v3' ? buildV3 : buildV4;

	const builder = parseSchema(schema, {
		build,
		module,
		name,
		path: [],
		seen: new Map(),
		...rest,
		zodVersion,
	});

	let result = builder.text();

	const jsdocs =
		rest.withJsdocs &&
		typeof schema !== 'boolean' &&
		!('$ref' in schema) &&
		schema.description
			? expandJsdocs(schema.description)
			: '';

	if (module === 'cjs') {
		result = `${jsdocs}module.exports = ${name ? `{ ${JSON.stringify(name)}: ${result} }` : result}
`;

		if (!noImport) {
			result = `${jsdocs}const { z } = require("zod")

${result}`;
		}
	} else if (module === 'esm') {
		result = `${jsdocs}export ${name ? `const ${name} =` : `default`} ${result}
`;

		if (!noImport) {
			result = `import { z } from "zod"

${result}`;
		}
	} else if (name) {
		result = `${jsdocs}const ${name} = ${result}`;
	}

	if (type && name) {
		let typeName =
			typeof type === 'string'
				? type
				: `${name[0].toUpperCase()}${name.substring(1)}`;

		result += `export type ${typeName} = z.infer<typeof ${name}>
`;
	}

	return result;
};
