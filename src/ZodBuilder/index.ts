// Base builders (primitive data → Zod code)
export { BooleanBuilder, buildBoolean } from "./boolean.js";
export { NullBuilder, buildNull } from "./null.js";
export { ConstBuilder, buildLiteral, buildConst } from "./const.js";
export { EnumBuilder, buildEnum } from "./enum.js";
export {
  NumberBuilder,
  buildNumber,
  applyInt,
  applyMultipleOf,
  applyMin as applyNumberMin,
  applyMax as applyNumberMax,
} from "./number.js";
export {
  StringBuilder,
  buildString,
  applyFormat,
  applyPattern,
  applyMinLength,
  applyMaxLength,
  applyBase64,
  applyJsonTransform,
  applyPipe,
} from "./string.js";
export {
  ArrayBuilder,
  buildArray,
  buildTuple,
  applyMinItems,
  applyMaxItems,
} from "./array.js";
export {
  ObjectBuilder,
  buildObject,
  buildRecord,
  applyStrict,
  applyCatchall,
  applyPassthrough,
  applySuperRefine,
  applyAnd,
} from "./object.js";

// Generic modifiers
export {
  applyOptional,
  applyNullable,
  applyDefault,
  applyDescribe,
  applyBrand,
  applyReadonly,
  applyCatch,
} from "./modifiers.js";

// Builder factories
export function build() {
  return {
    number: () => {
      const { NumberBuilder } = require("./number.js");
      return new NumberBuilder();
    },
  };
}
