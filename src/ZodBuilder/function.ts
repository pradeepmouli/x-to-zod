import { ZodBuilder } from './BaseBuilder.js';

import z from 'zod';

/**
 * FunctionBuilder: represents z.function()
 * Supports function signature validation with args and returns
 */
export class FunctionBuilder extends ZodBuilder<'function'> {
	readonly typeKind = 'function' as const;
	private _input?: ZodBuilder[] = undefined;
	private _output?: ZodBuilder = undefined;

	constructor(params: {input?: ZodBuilder[], output?: ZodBuilder} = {}) {
		super();
		this._input = params.input;
		this._output = params.output;
	}

	/**
	 * Specify function arguments as an array of schemas
	 */
	input(...input: ZodBuilder[]): this {
		this._input = input;
		return this;
	}

	/**
	 * Specify function return type schema
	 */
	output(output: ZodBuilder): this {
		this._output = output;
		return this;
	}

	protected override base(): string {
		let params: string[] = [];

		if (this._input) {
			const argStrs = this._input.map((arg) => arg.text());
			params.push(`input: [${argStrs.join(',')}]`);
		}
		if (this._output) {
			params.push(`output: ${this._output.text()}`);
		}
		if (params.length === 0) {
			return 'z.function()';
		}
		else{
			return `z.function({${params.join(', ')}})`;
		}
	}
}
