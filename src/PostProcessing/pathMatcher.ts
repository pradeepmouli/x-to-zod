import type { PathSegment, CompiledSegment } from './pathParser.js';
import { parsePathPattern } from './pathParser.js';

const cache = new Map<string, CompiledSegment[]>();

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

export function matchPath(path: PathSegment[], pattern: string): boolean {
	const compiled = getCompiled(pattern);
	return matchSegments(path, compiled, 0, 0);
}
