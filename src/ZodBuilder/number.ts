import { withMessage } from "../utils/withMessage.js";

/**
 * Build a base Zod number schema string.
 */
export function buildNumber(): string {
  return "z.number()";
}

/**
 * Apply integer constraint to a number schema.
 */
export function applyInt(zodStr: string, errorMessage?: string): string {
  if (errorMessage) {
    return `${zodStr}.int(${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.int()`;
}

/**
 * Apply multipleOf constraint to a number schema.
 */
export function applyMultipleOf(zodStr: string, value: number, errorMessage?: string): string {
  // Special case: multipleOf 1 is equivalent to int
  if (value === 1) {
    // Avoid duplicate .int() if already present
    if (zodStr.includes(".int(")) {
      return zodStr;
    }
    return applyInt(zodStr, errorMessage);
  }

  if (errorMessage) {
    return `${zodStr}.multipleOf(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.multipleOf(${JSON.stringify(value)})`;
}

/**
 * Apply minimum constraint to a number schema.
 */
export function applyMin(
  zodStr: string,
  value: number,
  exclusive: boolean,
  errorMessage?: string,
): string {
  const method = exclusive ? "gt" : "gte";
  if (errorMessage) {
    return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.${method}(${JSON.stringify(value)})`;
}

/**
 * Apply maximum constraint to a number schema.
 */
export function applyMax(
  zodStr: string,
  value: number,
  exclusive: boolean,
  errorMessage?: string,
): string {
  const method = exclusive ? "lt" : "lte";
  if (errorMessage) {
    return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.${method}(${JSON.stringify(value)})`;
}
