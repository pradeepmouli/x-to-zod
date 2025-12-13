import { JsonSchemaObject } from "../Types.js";
import { buildBoolean } from "../ZodBuilder/index.js";

export const parseBoolean = (_schema: JsonSchemaObject & { type: "boolean" }) => {
  return buildBoolean();
};
