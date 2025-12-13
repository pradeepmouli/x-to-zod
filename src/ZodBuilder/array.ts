import { JsonSchemaObject, Refs } from "../Types.js";
import { withMessage } from "../utils/withMessage.js";

/**
 * Build a Zod array schema string from JSON schema array constraints.
 * Preserves exact modifier order and error message formatting.
 *
 * Note: This function requires parseSchema for items delegation,
 * so it accepts it as a parameter to avoid circular dependencies.
 */
export function buildArray(
  schema: JsonSchemaObject & { type: "array" },
  refs: Refs,
  parseSchema: (schema: any, refs: Refs) => string,
): string {
  if (Array.isArray(schema.items)) {
    return `z.tuple([${schema.items.map((v, i) =>
      parseSchema(v, { ...refs, path: [...refs.path, "items", i] }),
    )}])`;
  }

  let r = !schema.items
    ? "z.array(z.any())"
    : `z.array(${parseSchema(schema.items, {
        ...refs,
        path: [...refs.path, "items"],
      })})`;

  r += withMessage(schema, "minItems", ({ json }) => [`.min(${json}`, ", ", ")"]);

  r += withMessage(schema, "maxItems", ({ json }) => [`.max(${json}`, ", ", ")"]);

  return r;
}
