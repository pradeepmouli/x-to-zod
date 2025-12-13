import { Serializable } from "../Types.js";

/**
 * Build a Zod literal schema string from a const value.
 */
export function buildLiteral(value: Serializable): string {
  return `z.literal(${JSON.stringify(value)})`;
}

/**
 * @deprecated Use buildLiteral instead
 */
export const buildConst = buildLiteral;
