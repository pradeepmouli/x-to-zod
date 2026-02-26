/**
 * StringChecks mixin — provides no-op stub implementations for all string
 * check / format methods that ZodString and ZodStringFormat expose.
 *
 * Applied to both StringBuilder and StringFormatBuilder so that
 * `BuilderFor<ZodString>` / `BuilderFor<ZodStringFormat>` are satisfied
 * without duplicating dozens of stubs.
 *
 * The mixin only adds a method if the target prototype does **not** already
 * define it, so real implementations (e.g. `StringBuilder.regex()`) are never
 * overwritten.
 */

/** Shape of every string-check stub the mixin can contribute. */
export interface StringChecks {
	/* ── shared string checks ─────────────────────────────── */
	includes(_value: string, _params?: unknown): this;
	startsWith(_value: string, _params?: unknown): this;
	endsWith(_value: string, _params?: unknown): this;
	length(_len: number, _params?: unknown): this;
	nonempty(_params?: unknown): this;
	lowercase(_params?: unknown): this;
	uppercase(_params?: unknown): this;
	trim(): this;
	normalize(_form?: string): this;
	toLowerCase(): this;
	toUpperCase(): this;
	slugify(): this;

	/* ── string checks only needed by StringBuilder (from ZodString) ── */
	regex(_pattern: unknown, _params?: unknown): this;
	min(_value: number, _params?: unknown): this;
	max(_value: number, _params?: unknown): this;
	ip(_params?: unknown): this;
	safe(_params?: unknown): this;
	datetime(_params?: unknown): this;
	time(_params?: unknown): this;
	date(_params?: unknown): this;
	duration(_params?: unknown): this;
	guid(_params?: unknown): this;
	xid(_params?: unknown): this;
	ksuid(_params?: unknown): this;
	e164(_params?: unknown): this;
}

/** No-op implementations keyed by method name. */
const stubs: Record<keyof StringChecks, Function> = {
	includes(_v: string, _p?: unknown) {
		return this;
	},
	startsWith(_v: string, _p?: unknown) {
		return this;
	},
	endsWith(_v: string, _p?: unknown) {
		return this;
	},
	length(_n: number, _p?: unknown) {
		return this;
	},
	nonempty(_p?: unknown) {
		return this;
	},
	lowercase(_p?: unknown) {
		return this;
	},
	uppercase(_p?: unknown) {
		return this;
	},
	trim() {
		return this;
	},
	normalize(_f?: string) {
		return this;
	},
	toLowerCase() {
		return this;
	},
	toUpperCase() {
		return this;
	},
	slugify() {
		return this;
	},
	regex(_pat: unknown, _p?: unknown) {
		return this;
	},
	min(_v: number, _p?: unknown) {
		return this;
	},
	max(_v: number, _p?: unknown) {
		return this;
	},
	ip(_p?: unknown) {
		return this;
	},
	safe(_p?: unknown) {
		return this;
	},
	datetime(_p?: unknown) {
		return this;
	},
	time(_p?: unknown) {
		return this;
	},
	date(_p?: unknown) {
		return this;
	},
	duration(_p?: unknown) {
		return this;
	},
	guid(_p?: unknown) {
		return this;
	},
	xid(_p?: unknown) {
		return this;
	},
	ksuid(_p?: unknown) {
		return this;
	},
	e164(_p?: unknown) {
		return this;
	},
};

/**
 * Apply string-check stubs to a class prototype.
 * Only adds methods that are **not** already defined on the prototype,
 * preserving real implementations.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function applyStringChecks(target: Function): void {
	for (const [name, fn] of Object.entries(stubs)) {
		if (!(name in target.prototype)) {
			target.prototype[name] = fn;
		}
	}
}
