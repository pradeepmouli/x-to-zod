/**
 * Fluent StringBuilder: wraps a Zod string schema string and provides chainable methods.
 */
export class StringBuilder {
  private code: string;

  constructor() {
    this.code = "z.string()";
  }

  /**
   * Apply format constraint.
   */
  format(format: string, errorMessage?: string): this {
    this.code = applyFormat(this.code, format, errorMessage);
    return this;
  }

  /**
   * Apply regex pattern constraint.
   */
  regex(pattern: string | RegExp, errorMessage?: string): this {
    this.code = applyPattern(this.code, typeof pattern === "string" ? pattern : pattern.source, errorMessage);
    return this;
  }

  /**
   * Apply minLength constraint.
   */
  min(value: number, errorMessage?: string): this {
    this.code = applyMinLength(this.code, value, errorMessage);
    return this;
  }

  /**
   * Apply maxLength constraint.
   */
  max(value: number, errorMessage?: string): this {
    this.code = applyMaxLength(this.code, value, errorMessage);
    return this;
  }

  /**
   * Apply email format.
   */
  email(errorMessage?: string): this {
    this.code = applyFormat(this.code, "email", errorMessage);
    return this;
  }

  /**
   * Apply uuid format.
   */
  uuid(errorMessage?: string): this {
    this.code = applyFormat(this.code, "uuid", errorMessage);
    return this;
  }

  /**
   * Apply base64 encoding constraint.
   */
  base64(errorMessage?: string): this {
    this.code = applyBase64(this.code, errorMessage);
    return this;
  }

  /**
   * Apply JSON transform.
   */
  json(errorMessage?: string): this {
    this.code = applyJsonTransform(this.code, errorMessage);
    return this;
  }

  /**
   * Apply pipe with parsed content schema.
   */
  pipe(contentSchemaZod: string, errorMessage?: string): this {
    this.code = applyPipe(this.code, contentSchemaZod, errorMessage);
    return this;
  }

  /**
   * Apply optional constraint.
   */
  optional(): this {
    const { applyOptional } = require("./modifiers.js");
    this.code = applyOptional(this.code);
    return this;
  }

  /**
   * Apply nullable constraint.
   */
  nullable(): this {
    const { applyNullable } = require("./modifiers.js");
    this.code = applyNullable(this.code);
    return this;
  }

  /**
   * Apply default value.
   */
  default(value: any): this {
    const { applyDefault } = require("./modifiers.js");
    this.code = applyDefault(this.code, value);
    return this;
  }

  /**
   * Apply describe modifier.
   */
  describe(description: string): this {
    const { applyDescribe } = require("./modifiers.js");
    this.code = applyDescribe(this.code, description);
    return this;
  }

  /**
   * Unwrap and return the final Zod code string.
   */
  done(): string {
    return this.code;
  }
}

/**
 * Build a base Zod string schema string.
 */
export function buildString(): string {
  return "z.string()";
}

/**
 * Apply format constraint to a string schema.
 */
export function applyFormat(zodStr: string, format: string, errorMessage?: string): string {
  switch (format) {
    case "email":
      return errorMessage
        ? `${zodStr}.email(${JSON.stringify(errorMessage)})`
        : `${zodStr}.email()`;
    case "ip":
      return errorMessage ? `${zodStr}.ip(${JSON.stringify(errorMessage)})` : `${zodStr}.ip()`;
    case "ipv4":
      return errorMessage
        ? `${zodStr}.ip({ version: "v4", message: ${JSON.stringify(errorMessage)} })`
        : `${zodStr}.ip({ version: "v4" })`;
    case "ipv6":
      return errorMessage
        ? `${zodStr}.ip({ version: "v6", message: ${JSON.stringify(errorMessage)} })`
        : `${zodStr}.ip({ version: "v6" })`;
    case "uri":
      return errorMessage ? `${zodStr}.url(${JSON.stringify(errorMessage)})` : `${zodStr}.url()`;
    case "uuid":
      return errorMessage ? `${zodStr}.uuid(${JSON.stringify(errorMessage)})` : `${zodStr}.uuid()`;
    case "date-time":
      return errorMessage
        ? `${zodStr}.datetime({ offset: true, message: ${JSON.stringify(errorMessage)} })`
        : `${zodStr}.datetime({ offset: true })`;
    case "time":
      return errorMessage ? `${zodStr}.time(${JSON.stringify(errorMessage)})` : `${zodStr}.time()`;
    case "date":
      return errorMessage ? `${zodStr}.date(${JSON.stringify(errorMessage)})` : `${zodStr}.date()`;
    case "binary":
      return errorMessage
        ? `${zodStr}.base64(${JSON.stringify(errorMessage)})`
        : `${zodStr}.base64()`;
    case "duration":
      return errorMessage
        ? `${zodStr}.duration(${JSON.stringify(errorMessage)})`
        : `${zodStr}.duration()`;
    default:
      return zodStr;
  }
}

/**
 * Apply regex pattern constraint to a string schema.
 */
export function applyPattern(zodStr: string, pattern: string, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.regex(new RegExp(${JSON.stringify(pattern)}), ${JSON.stringify(errorMessage)})`
    : `${zodStr}.regex(new RegExp(${JSON.stringify(pattern)}))`;
}

/**
 * Apply minLength constraint to a string schema.
 */
export function applyMinLength(zodStr: string, value: number, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.min(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`
    : `${zodStr}.min(${JSON.stringify(value)})`;
}

/**
 * Apply maxLength constraint to a string schema.
 */
export function applyMaxLength(zodStr: string, value: number, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.max(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`
    : `${zodStr}.max(${JSON.stringify(value)})`;
}

/**
 * Apply base64 encoding constraint to a string schema.
 */
export function applyBase64(zodStr: string, errorMessage?: string): string {
  return errorMessage ? `${zodStr}.base64(${JSON.stringify(errorMessage)})` : `${zodStr}.base64()`;
}

/**
 * Apply JSON transform to a string schema.
 * Note: The transform function always uses "Invalid JSON" as the internal error message.
 * The errorMessage parameter becomes the second argument to .transform() for Zod's error handling.
 */
export function applyJsonTransform(zodStr: string, errorMessage?: string): string {
  const transformPart = `(str, ctx) => { try { return JSON.parse(str); } catch (err) { ctx.addIssue({ code: "custom", message: "Invalid JSON" }); }}`;

  if (errorMessage) {
    return `${zodStr}.transform(${transformPart}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.transform(${transformPart})`;
} /**
 * Apply pipe with parsed content schema.
 */
export function applyPipe(zodStr: string, contentSchemaZod: string, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.pipe(${contentSchemaZod}, ${JSON.stringify(errorMessage)})`
    : `${zodStr}.pipe(${contentSchemaZod})`;
}
