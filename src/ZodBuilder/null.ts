import { JsonSchemaObject } from "../Types.js";

/**
 * Build a Zod null schema string.
 */
export function buildNull(_schema: JsonSchemaObject & { type: "null" }): string {
  return "z.null()";
}
