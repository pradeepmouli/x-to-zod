import type { ZodFunction } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * FunctionBuilder: represents z.function()
 * Supports function signature validation with args and returns
 */
export class FunctionBuilder extends ZodBuilder<ZodFunction> {
	readonly typeKind = 'function' as const;
	private _input?: Builder[] = undefined;
	private _output?: Builder = undefined;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params: { input?: Builder[]; output?: Builder } = {},
	) {
		super(version);
		this._input = params.input;
		this._output = params.output;
	}

	/**
	 * Specify function arguments as an array of schemas
	 */
	args(...input: Builder[]): FunctionBuilder {
		return new FunctionBuilder(this._version, { input, output: this._output });
	}

	/**
	 * Specify function return type schema
	 */
	returns(output: Builder): FunctionBuilder {
		return new FunctionBuilder(this._version, { input: this._input, output });
	}

	protected override base(): string {
		let result = 'z.function()';

		if (this._input) {
			const argStrs = this._input.map((arg) => arg.text());
			result += `.args(${argStrs.join(',')})`;
		}
		if (this._output) {
			result += `.returns(${this._output.text()})`;
		}

		return result;
	}
}
