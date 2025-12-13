import { JsonSchemaObject } from "../Types.js";

/**
 * Build a Zod boolean schema string.
 */
export function buildBoolean(_schema: JsonSchemaObject & { type: "boolean" }): string {
  return "z.boolean()";
}
