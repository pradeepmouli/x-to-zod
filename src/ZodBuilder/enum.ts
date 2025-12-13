import { Serializable } from "../Types.js";

/**
 * Build a Zod enum schema string from an array of enum values.
 * Handles empty enums, single literals, string enums, and mixed-type unions.
 */
export function buildEnum(values: Serializable[]): string {
  if (values.length === 0) {
    return "z.never()";
  } else if (values.length === 1) {
    // union does not work when there is only one element
    return `z.literal(${JSON.stringify(values[0])})`;
  } else if (values.every((x) => typeof x === "string")) {
    return `z.enum([${values.map((x) => JSON.stringify(x))}])`;
  } else {
    return `z.union([${values.map((x) => `z.literal(${JSON.stringify(x)})`).join(", ")}])`;
  }
}
