export type PathSegment = string | number;

export type CompiledSegment =
	| { kind: 'literal'; value: string }
	| { kind: 'wildcard' }
	| { kind: 'deepWildcard' };

/**
 * Parse a JSONPath-inspired pattern into compiled segments.
 * Supports:
 * - $ root
 * - dot-separated segments
 * - single-segment wildcard `*`
 * - deep wildcard `**`
 * - recursive descent `$..foo` (compiled as leading `**` plus literal segments)
 */
export function parsePathPattern(pattern: string): CompiledSegment[] {
	const normalized = pattern.trim();
	if (normalized === '$') return [];

	const hasRecursive = normalized.startsWith('$..');
	const withoutPrefix = normalized.replace(/^\$\.\.?/, '');
	const rawSegments = hasRecursive
		? ['**', ...withoutPrefix.replace(/^\./, '').split('.')]
		: withoutPrefix.split('.');

	return rawSegments
		.filter((segment) => segment.length > 0)
		.map<CompiledSegment>((segment) => {
			if (segment === '*') return { kind: 'wildcard' };
			if (segment === '**') return { kind: 'deepWildcard' };
			return { kind: 'literal', value: segment };
		});
}
