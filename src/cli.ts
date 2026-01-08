#!/usr/bin/env node
import { jsonSchemaToZod } from './jsonSchemaToZod.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';
import { pathToFileURL } from 'url';
import { parseArgs, parseOrReadJSON, readPipe } from './utils/cliTools.js';
import { JsonSchema } from './Types.js';

const params = {
	input: {
		shorthand: 'i',
		value: 'string',
		required:
			process.stdin.isTTY &&
			'input is required when no JSON or file path is piped',
		description: 'JSON or a source file path. Required if no data is piped.',
	},
	output: {
		shorthand: 'o',
		value: 'string',
		description:
			'A file path to write to. If not supplied stdout will be used.',
	},
	name: {
		shorthand: 'n',
		value: 'string',
		description: 'The name of the schema in the output.',
	},
	depth: {
		shorthand: 'd',
		value: 'number',
		description:
			'Maximum depth of recursion before falling back to z.any(). Defaults to 0.',
	},
	module: {
		shorthand: 'm',
		value: ['esm', 'cjs', 'none'],
		description: "Module syntax; 'esm', 'cjs' or 'none'. Defaults to 'esm'.",
	},
	postProcessors: {
		shorthand: 'p',
		value: 'string',
		description:
			'Path to a module exporting an array named postProcessors for builder transforms.',
	},
	type: {
		shorthand: 't',
		value: 'string',
		description: 'The name of the (optional) inferred type export.',
	},
	noImport: {
		shorthand: 'ni',
		description:
			"Removes the `import { z } from 'zod';` or equivalent from the output.",
	},
	withJsdocs: {
		shorthand: 'wj',
		description: 'Generate jsdocs off of the description property.',
	},
} as const;

async function loadPostProcessors(modulePath: string) {
	const resolved = isAbsolute(modulePath)
		? modulePath
		: resolve(process.cwd(), modulePath);

	try {
		const imported = await import(pathToFileURL(resolved).href);
		const candidate =
			imported?.postProcessors ||
			imported?.default?.postProcessors ||
			imported?.default;

		if (Array.isArray(candidate)) {
			return candidate;
		}
	} catch (error) {
		throw new Error(
			`Failed to load postProcessors module at ${modulePath}: ${(error as Error).message}`,
		);
	}

	throw new Error(
		`Expected module ${modulePath} to export an array named postProcessors`,
	);
}

async function main() {
	const args = parseArgs(params, process.argv, true);
	const input = args.input || (await readPipe());
	const jsonSchema = parseOrReadJSON(input);
	const postProcessors = args.postProcessors
		? await loadPostProcessors(args.postProcessors)
		: undefined;
	const zodSchema = jsonSchemaToZod(jsonSchema as JsonSchema, {
		name: args.name,
		depth: args.depth,
		module: args.module || 'esm',
		noImport: args.noImport,
		type: args.type,
		withJsdocs: args.withJsdocs,
		postProcessors,
	});

	if (args.output) {
		mkdirSync(dirname(args.output), { recursive: true });
		writeFileSync(
			args.output,
			zodSchema.endsWith('\n') ? zodSchema : zodSchema + '\n',
		);
	} else {
		process.stdout.write(
			zodSchema.endsWith('\n') ? zodSchema : zodSchema + '\n',
		);
	}
}

void main();
