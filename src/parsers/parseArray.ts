import { JsonSchemaObject, Refs } from "../Types.js";
import { buildArray } from "../ZodBuilder/index.js";
import { parseSchema } from "./parseSchema.js";

export const parseArray = (schema: JsonSchemaObject & { type: "array" }, refs: Refs) => {
  return buildArray(schema, refs, parseSchema);
};
