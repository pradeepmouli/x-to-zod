import { JsonSchemaObject } from "../Types.js";
import { buildString } from "../ZodBuilder/index.js";
import { parseSchema } from "./parseSchema.js";

export const parseString = (schema: JsonSchemaObject & { type: "string" }) => {
  return buildString(schema, parseSchema);
};
