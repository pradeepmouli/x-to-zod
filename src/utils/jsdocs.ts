import type { JSONSchemaObject } from '../JsonSchema/types/index.js';

export const expandJsdocs = (jsdocs: string): string => {
	const lines = jsdocs.split('\n');
	const result =
		lines.length === 1
			? lines[0]
			: `\n${lines.map((x) => `* ${x}`).join('\n')}\n`;

	return `/**${result}*/\n`;
};

export const addJsdocs = (schema: JSONSchemaObject, parsed: string): string => {
	const description = schema.description as string;
	if (!description) {
		return parsed;
	}

	return `\n${expandJsdocs(description)}${parsed}`;
};
