#!/usr/bin/env node
import { jsonSchemaToZod } from './jsonSchemaToZod.js';
import { writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, isAbsolute, resolve, extname } from 'path';
import { pathToFileURL } from 'url';
import { parseArgs, parseOrReadJSON, readPipe } from './utils/cliTools.js';
import { JsonSchema } from './Types.js';
import { SchemaProject } from './SchemaProject/SchemaProject.js';

const params = {
	input: {
		shorthand: 'i',
		value: 'string',
		required: false, // Will be checked conditionally in main based on project mode
		description: 'JSON or a source file path. Required if no data is piped (single-schema mode).',
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
	// Project mode flags
	project: {
		shorthand: 'pr',
		description: 'Enable multi-schema project mode.',
	},
	schemas: {
		shorthand: 's',
		value: 'string',
		description:
			'Glob pattern or file path to schema files (can be repeated). Required in project mode.',
	},
	out: {
		shorthand: 'out',
		value: 'string',
		description:
			'Output directory for project mode. Required when using --project.',
	},
	moduleFormat: {
		shorthand: 'mf',
		value: ['esm', 'cjs', 'both'],
		description:
			"Module format for project mode; 'esm', 'cjs', or 'both'. Defaults to 'both'.",
	},
	zodVersion: {
		shorthand: 'zv',
		value: ['v3', 'v4'],
		description: "Zod version target; 'v3' or 'v4'. Defaults to 'v4'.",
	},
	generateIndex: {
		shorthand: 'gi',
		description: 'Generate index.ts barrel export in project mode.',
	},
	extractDefinitions: {
		shorthand: 'ed',
		description:
			'Extract definitions/components into separate files in project mode.',
	},
	definitionsDir: {
		shorthand: 'dd',
		value: 'string',
		description:
			"Subdirectory for extracted definitions (default: 'definitions'). Used with --extract-definitions.",
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

/**
 * Simple glob pattern expansion for common cases (*.json, *.yaml, dir/*.json, etc.)
 * Falls back to treating pattern as a literal file path if no wildcards
 */
function expandGlobPattern(pattern: string): string[] {
	const cwd = process.cwd();
	const fullPattern = isAbsolute(pattern)
		? pattern
		: resolve(cwd, pattern);

	// If pattern has no wildcards, treat as literal file path
	if (!pattern.includes('*') && !pattern.includes('?')) {
		try {
			const stat = statSync(fullPattern);
			if (stat.isFile()) {
				return [fullPattern];
			} else if (stat.isDirectory()) {
				// If directory, find JSON files
				return readdirSync(fullPattern)
					.filter((f) => f.endsWith('.json') || f.endsWith('.yaml') || f.endsWith('.yml'))
					.map((f) => resolve(fullPattern, f));
			}
		} catch {
			return [];
		}
	}

	// Simple wildcard expansion
	if (pattern === '*' || pattern === '*.json' || pattern === '**/*.json') {
		return expandWildcards(cwd, pattern);
	}

	// For complex patterns, just try as literal path
	try {
		if (statSync(fullPattern).isFile()) {
			return [fullPattern];
		}
	} catch {
		return [];
	}

	return [];
}

/**
 * Expand wildcard patterns recursively
 */
function expandWildcards(dir: string, pattern: string): string[] {
	const results: string[] = [];

	try {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = resolve(dir, entry.name);

			// Handle ** (recursive)
			if (pattern.includes('**')) {
				if (entry.isDirectory()) {
					results.push(...expandWildcards(fullPath, pattern));
				}
			}

			// Match file pattern
			if (entry.isFile()) {
				const ext = extname(entry.name);
				if (ext === '.json' || ext === '.yaml' || ext === '.yml') {
					results.push(fullPath);
				}
			}
		}
	} catch {
		// Ignore directory access errors
	}

	return results;
}

async function projectMode(args: Record<string, unknown>): Promise<void> {
	// Validate required flags for project mode
	if (!args.schemas) {
		console.error('Error: --schemas flag is required in project mode.');
		process.exit(1);
	}

	if (!args.out) {
		console.error('Error: --out flag is required in project mode.');
		process.exit(1);
	}

	// Validate module format
	const moduleFormat =
		(args as Record<string, unknown>).moduleFormat ||
		(args as Record<string, unknown>)['module-format'] ||
		'both';
	if (!['esm', 'cjs', 'both'].includes(moduleFormat as string)) {
		console.error(
			`Error: Invalid --module-format '${moduleFormat}'. Must be 'esm', 'cjs', or 'both'.`,
		);
		process.exit(1);
	}

	// Validate zod version
	const zodVersion =
		(args as Record<string, unknown>).zodVersion ||
		(args as Record<string, unknown>)['zod-version'] ||
		'v4';
	if (!['v3', 'v4'].includes(zodVersion as string)) {
		console.error(
			`Error: Invalid --zod-version '${zodVersion}'. Must be 'v3' or 'v4'.`,
		);
		process.exit(1);
	}

	// Resolve schema glob patterns
	const schemaPatterns = Array.isArray(args.schemas)
		? (args.schemas as string[])
		: [(args.schemas as string)];

	const schemaFiles: string[] = [];
	for (const pattern of schemaPatterns) {
		const expandedFiles = expandGlobPattern(pattern);
		if (expandedFiles.length === 0) {
			console.error(`Warning: No files matched pattern '${pattern}'`);
		}
		schemaFiles.push(...expandedFiles);
	}

	if (schemaFiles.length === 0) {
		console.error(
			`Error: No schema files matched the pattern(s): ${schemaPatterns.join(', ')}`,
		);
		process.exit(1);
	}

	// Create SchemaProject
	const outDir = resolve(process.cwd(), args.out as string);
	const extractDefinitions = args.extractDefinitions
		? {
				enabled: true,
				subdir: (args.definitionsDir as string) || 'definitions',
			}
		: undefined;

	const project = new SchemaProject({
		outDir,
		moduleFormat: moduleFormat as 'esm' | 'cjs' | 'both',
		zodVersion: zodVersion as 'v3' | 'v4',
		generateIndex: args.generateIndex !== false,
		extractDefinitions,
	});

	// Load schemas
	for (const filePath of schemaFiles) {
		const fullPath = resolve(process.cwd(), filePath);
		try {
			await project.addSchemaFromFile(fullPath, undefined);
		} catch (error) {
			console.error(
				`Error loading schema from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
			);
			process.exit(1);
		}
	}

	// Validate project
	const validationResult = project.validate();
	if (!validationResult.valid) {
		console.error('Project validation failed:');

		// Format and display errors
		if (validationResult.errors && validationResult.errors.length > 0) {
			console.error('\nErrors:');
			for (const error of validationResult.errors) {
				if ((error as any).code === 'EXPORT_NAME_CONFLICT') {
					console.error(
						`  - Export name conflict: ${(error as any).conflictingSchemaIds?.join(', ')} all export as '${(error as any).exportName}'`,
					);
				} else if ((error as any).code === 'MISSING_REF') {
					console.error(
						`  - Missing $ref: ${(error as any).ref} in schema ${(error as any).schemaId}`,
					);
				} else {
					console.error(`  - ${(error as any).message}`);
				}
			}
		}

		// Display warnings
		if (validationResult.warnings && validationResult.warnings.length > 0) {
			console.warn('\nWarnings:');
			for (const warning of validationResult.warnings) {
				console.warn(`  - ${(warning as any).message}`);
			}
		}

		process.exit(1);
	}

	// Build project
	const buildResult = await project.build();
	if (!buildResult.success) {
		console.error('Project build failed:');

		if (buildResult.errors && buildResult.errors.length > 0) {
			console.error('\nErrors:');
			for (const error of buildResult.errors) {
				if ((error as any).code === 'PARSE_FAILED') {
					console.error(
						`  - Parse error in schema ${(error as any).schemaId}: ${(error as any).message}`,
					);
				} else if ((error as any).code === 'GENERATION_FAILED') {
					console.error(
						`  - Generation error in schema ${(error as any).schemaId}: ${(error as any).message}`,
					);
				} else {
					console.error(`  - ${(error as any).message}`);
				}
			}
		}

		process.exit(1);
	}

	// Success
	console.log(`✓ Project built successfully!`);
	console.log(`  Output directory: ${outDir}`);
	console.log(`  Generated files: ${buildResult.generatedFiles?.length || 0}`);
	if (buildResult.generatedFiles && buildResult.generatedFiles.length > 0) {
		for (const file of buildResult.generatedFiles.slice(0, 5)) {
			console.log(`    - ${file}`);
		}
		if (buildResult.generatedFiles.length > 5) {
			console.log(`    ... and ${buildResult.generatedFiles.length - 5} more`);
		}
	}
}

async function main() {
	const args = parseArgs(params, process.argv, true);

	// Project mode
	if (args.project) {
		return await projectMode(args);
	}

	// Single-schema mode - input is required
	if (!args.input && process.stdin.isTTY) {
		console.error('Error: input is required when no JSON or file path is piped');
		process.exit(1);
	}

	// Single-schema mode (original behavior)
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
