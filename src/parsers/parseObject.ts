import { JsonSchemaObject, Refs } from "../Types.js";
import { buildObject } from "../ZodBuilder/index.js";
import { parseAnyOf } from "./parseAnyOf.js";
import { parseOneOf } from "./parseOneOf.js";
import { its, parseSchema } from "./parseSchema.js";
import { parseAllOf } from "./parseAllOf.js";

export function parseObject(
  objectSchema: JsonSchemaObject & { type: "object" },
  refs: Refs,
): string {
  return buildObject(objectSchema, refs, parseSchema, parseAnyOf, parseOneOf, parseAllOf, its);
}
