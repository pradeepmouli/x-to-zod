import { JsonSchemaObject } from "../Types.js";
import { BooleanBuilder } from "../ZodBuilder/index.js";

export const parseBoolean = (_schema: JsonSchemaObject & { type: "boolean" }) => {
  return new BooleanBuilder().done();
};
