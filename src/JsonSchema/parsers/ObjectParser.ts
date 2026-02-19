import type { Context } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { ObjectBuilder } from '../../ZodBuilder/index.js';
import { addJsdocs } from '../../utils/jsdocs.js';
import { parseSchema } from './parseSchema.js';
import { is } from '../is.js';

export class ObjectParser extends BaseParser<'object'> {
	readonly typeKind = 'object' as const;

	constructor(schema: JSONSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const objectSchema = schema as JSONSchemaObject & {
			type: 'object';
			properties?: Record<string, JSONSchema>;
			required?: string[];
			additionalProperties?: JSONSchema | boolean;
			patternProperties?: Record<string, JSONSchema>;
			anyOf?: JSONSchema[];
			oneOf?: JSONSchema[];
			allOf?: JSONSchema[];
		};
		let result = '' as string;

		// Step 1: Build base object from properties
		if (
			objectSchema.properties &&
			Object.keys(objectSchema.properties).length > 0
		) {
			const properties: Record<string, ZodBuilder> = {};
			const propsWithJsdocs: string[] = [];

			for (const key of Object.keys(objectSchema.properties)) {
				const propSchema = objectSchema.properties[key];

				let propZod = parseSchema(propSchema, {
					...this.refs,
					path: [...this.refs.path, 'properties', key],
				});

				const hasDefault =
					typeof propSchema === 'object' &&
					!('$ref' in propSchema) &&
					(propSchema as any).default !== undefined;
				const required = Array.isArray(objectSchema.required)
					? objectSchema.required.includes(key)
					: false;
				const optional = !hasDefault && !required;

				if (optional) {
					propZod.optional();
				}

				properties[key] = propZod;

				let propStr = `${JSON.stringify(key)}: ${propZod.text()}`;
				if (this.refs.withJsdocs && typeof propSchema === 'object') {
					propStr = addJsdocs(propSchema as any, propStr);
				}
				propsWithJsdocs.push(propStr);
			}

			if (this.refs.withJsdocs) {
				result = `z.object({ ${propsWithJsdocs.join(', ')} })`;
			} else {
				result = this.refs.build.object(properties).text();
			}
		} else if (objectSchema.properties) {
			result = this.refs.build.object({}).text();
		} else {
			result = '';
		}

		// Step 2: Handle additionalProperties
		const additionalPropertiesZod =
			objectSchema.additionalProperties !== undefined
				? parseSchema(objectSchema.additionalProperties as any, {
						...this.refs,
						path: [...this.refs.path, 'additionalProperties'],
					})
				: undefined;

		// Step 3: Handle patternProperties
		if (objectSchema.patternProperties) {
			const parsedPatternProps = Object.fromEntries(
				Object.entries(objectSchema.patternProperties).map(
					([pattern, propSchema]) => [
						pattern,
						parseSchema(propSchema as any, {
							...this.refs,
							path: [...this.refs.path, 'patternProperties', pattern],
						}).text(),
					],
				),
			);

			if (result) {
				const catchallSchemas = Object.values(parsedPatternProps);
				if (additionalPropertiesZod) {
					catchallSchemas.push(additionalPropertiesZod.text());
				}

				const builder = ObjectBuilder.fromCode(result);
				if (catchallSchemas.length > 1) {
					builder.catchall(`z.union([${catchallSchemas.join(', ')}])`);
				} else if (catchallSchemas.length === 1) {
					builder.catchall(catchallSchemas[0]);
				}
				result = builder.text();
			} else {
				const valueSchemas = Object.values(parsedPatternProps);
				if (additionalPropertiesZod) {
					valueSchemas.push(additionalPropertiesZod.text());
				}

				if (valueSchemas.length > 1) {
					const unionSchema = this.refs.build.union(
						valueSchemas.map((s) => ObjectBuilder.fromCode(s)),
					);
					result = this.refs.build
						.record(this.refs.build.string(), unionSchema)
						.text();
				} else if (valueSchemas.length === 1) {
					result = this.refs.build
						.record(
							this.refs.build.string(),
							ObjectBuilder.fromCode(valueSchemas[0]),
						)
						.text();
				}
			}

			let refineFn = '(value, ctx) => {\n';
			refineFn += 'for (const key in value) {\n';

			if (additionalPropertiesZod) {
				if (
					objectSchema.properties &&
					Object.keys(objectSchema.properties).length > 0
				) {
					const propKeys = Object.keys(objectSchema.properties)
						.map((k) => JSON.stringify(k))
						.join(', ');
					refineFn += `let evaluated = [${propKeys}].includes(key)\n`;
				} else {
					refineFn += 'let evaluated = false\n';
				}
			}

			for (const [pattern, patternZod] of Object.entries(parsedPatternProps)) {
				refineFn += `if (key.match(new RegExp(${JSON.stringify(pattern)}))) {\n`;
				if (additionalPropertiesZod) {
					refineFn += 'evaluated = true\n';
				}
				refineFn += `const result = ${patternZod}.safeParse(value[key])\n`;
				refineFn += 'if (!result.success) {\n';
				refineFn += `ctx.addIssue({\n          path: [key],\n          code: 'custom',\n          message: \`Invalid input: Key matching regex /\${key}/ must match schema\`,\n          params: {\n            issues: result.error.issues\n          }\n        })\n`;
				refineFn += '}\n';
				refineFn += '}\n';
			}

			if (additionalPropertiesZod) {
				refineFn += 'if (!evaluated) {\n';
				refineFn += `const result = ${additionalPropertiesZod.text()}.safeParse(value[key])\n`;
				refineFn += 'if (!result.success) {\n';
				refineFn += `ctx.addIssue({\n          path: [key],\n          code: 'custom',\n          message: \`Invalid input: must match catchall schema\`,\n          params: {\n            issues: result.error.issues\n          }\n        })\n`;
				refineFn += '}\n';
				refineFn += '}\n';
			}

			refineFn += '}\n';
			refineFn += '}';

			result = ObjectBuilder.fromCode(result, this.refs)
				.superRefine(refineFn)
				.text();
		} else if (result && additionalPropertiesZod) {
			const builder = ObjectBuilder.fromCode(result, this.refs);
			const apText = additionalPropertiesZod.text();
			if (apText === 'z.never()') {
				result = builder.strict().text();
			} else {
				result = builder.catchall(apText).text();
			}
		} else if (!result) {
			if (additionalPropertiesZod) {
				result = this.refs.build
					.record(this.refs.build.string(), additionalPropertiesZod)
					.text();
			} else {
				result = this.refs.build
					.record(this.refs.build.string(), this.refs.build.any())
					.text();
			}
		}

		// Step 4: Handle combinators (anyOf, oneOf, allOf)
		let builder = ObjectBuilder.fromCode(result, this.refs);

		if (is.anyOf(objectSchema as any)) {
			const anyOfZod = parseSchema(
				{
					...(objectSchema as any),
					anyOf: (objectSchema.anyOf || []).map((x: JSONSchema) =>
						typeof x === 'object' &&
						!('$ref' in x) &&
						!(x as any).type &&
						((x as any).properties ||
							(x as any).additionalProperties ||
							(x as any).patternProperties)
							? { ...(x as any), type: 'object' }
							: x,
					),
				} as any,
				this.refs,
			);
			builder.and(anyOfZod);
		}

		if (is.oneOf(objectSchema as any)) {
			const oneOfZod = parseSchema(
				{
					...(objectSchema as any),
					oneOf: (objectSchema.oneOf || []).map((x: JSONSchema) =>
						typeof x === 'object' &&
						!('$ref' in x) &&
						!(x as any).type &&
						((x as any).properties ||
							(x as any).additionalProperties ||
							(x as any).patternProperties)
							? { ...(x as any), type: 'object' }
							: x,
					),
				} as any,
				this.refs,
			);
			builder.and(oneOfZod);
		}

		if (is.allOf(objectSchema as any)) {
			const allOfZod = parseSchema(
				{
					...(objectSchema as any),
					allOf: (objectSchema.allOf || []).map((x: JSONSchema) =>
						typeof x === 'object' &&
						!('$ref' in x) &&
						!(x as any).type &&
						((x as any).properties ||
							(x as any).additionalProperties ||
							(x as any).patternProperties)
							? { ...(x as any), type: 'object' }
							: x,
					),
				} as any,
				this.refs,
			);
			builder.and(allOfZod);
		}

		return builder;
	}
}
