import { JsonSchemaObject, Serializable } from "../Types.js";

/**
 * Build a Zod literal/const schema string.
 */
export function buildConst(schema: JsonSchemaObject & { const: Serializable }): string {
  return `z.literal(${JSON.stringify(schema.const)})`;
}
