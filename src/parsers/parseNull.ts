import { JsonSchemaObject } from "../Types.js";
import { NullBuilder } from "../ZodBuilder/index.js";

export const parseNull = (_schema: JsonSchemaObject & { type: "null" }) => {
  return new NullBuilder().done();
};
