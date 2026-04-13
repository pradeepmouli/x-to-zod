import type { PathSegment, CompiledSegment } from './pathParser.js';
import { parsePathPattern } from './pathParser.js';

const cache = new Map<string, CompiledSegment[]>();

/**
 * Clears the internal compiled-pattern cache.
 *
 * Path patterns are compiled from their string form into a `CompiledSegment[]`
 * array on first use and cached for subsequent calls. Call this function in
 * tests or long-lived processes where patterns change dynamically to avoid
 * stale cache entries.
 */
export function clearPathPatternCache(): void {
	cache.clear();
}

function getCompiled(pattern: string): CompiledSegment[] {
	const cached = cache.get(pattern);
	if (cached) return cached;
	const compiled = parsePathPattern(pattern);
	cache.set(pattern, compiled);
	return compiled;
}

function matchSegments(
	path: PathSegment[],
	segments: CompiledSegment[],
	pathIndex: number,
	segmentIndex: number,
): boolean {
	if (segmentIndex === segments.length) {
		return pathIndex === path.length;
	}

	const segment = segments[segmentIndex];

	if (segment.kind === 'deepWildcard') {
		for (let i = pathIndex; i <= path.length; i += 1) {
			if (matchSegments(path, segments, i, segmentIndex + 1)) {
				return true;
			}
		}
		return false;
	}

	if (pathIndex >= path.length) {
		return false;
	}

	if (segment.kind === 'wildcard') {
		return matchSegments(path, segments, pathIndex + 1, segmentIndex + 1);
	}

	if (segment.kind === 'literal') {
		const current = path[pathIndex];
		if (String(current) !== segment.value) {
			return false;
		}
		return matchSegments(path, segments, pathIndex + 1, segmentIndex + 1);
	}

	return false;
}

/**
 * Tests whether a resolved schema path matches a glob-style path pattern.
 *
 * Supports `*` (single-segment wildcard) and `**` (deep multi-segment wildcard)
 * as special tokens. Literal segments are compared as strings, so numeric array
 * indices are matched literally.
 *
 * @param path - The resolved path as an array of `PathSegment` values (strings or numbers).
 * @param pattern - The glob-style pattern string (e.g. `'**.id'`, `'addresses.*.street'`).
 * @returns `true` when the path matches the compiled pattern; `false` otherwise.
 *
 * @example
 * ```ts
 * matchPath(['user', 'address', 'street'], '**.street'); // true
 * matchPath(['user', 'name'], 'user.*');                 // true
 * matchPath(['user', 'id'], 'post.id');                  // false
 * ```
 */
export function matchPath(path: PathSegment[], pattern: string): boolean {
	const compiled = getCompiled(pattern);
	return matchSegments(path, compiled, 0, 0);
}
