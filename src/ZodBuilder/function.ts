import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * FunctionBuilder: represents z.function()
 * Supports function signature validation with args and returns
 */
export class FunctionBuilder extends ZodBuilder<'function'> {
	readonly typeKind = 'function' as const;
	private _input?: Builder[] = undefined;
	private _output?: Builder = undefined;

	constructor(
		params: { input?: Builder[]; output?: Builder } = {},
		version?: 'v3' | 'v4',
	) {
		super(version);
		this._input = params.input;
		this._output = params.output;
	}

	/**
	 * Specify function arguments as an array of schemas
	 */
	args(...input: Builder[]): FunctionBuilder {
		return new FunctionBuilder({ input, output: this._output });
	}

	/**
	 * Specify function return type schema
	 */
	returns(output: Builder): FunctionBuilder {
		return new FunctionBuilder({ input: this._input, output });
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
