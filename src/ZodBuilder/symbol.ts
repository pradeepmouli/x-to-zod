import type { ZodSymbol } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * SymbolBuilder: represents z.symbol()
 */
export class SymbolBuilder extends ZodBuilder<ZodSymbol> {
	readonly typeKind = 'symbol' as const;
}
