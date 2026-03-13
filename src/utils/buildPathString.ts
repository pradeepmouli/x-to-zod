/**
 * Build a JSON path string from an array of path segments.
 * Returns '$' for empty paths, otherwise '$.segment1.segment2...'.
 */
export function buildPathString(path: (string | number)[]): string {
	return path.length ? `$.${path.join('.')}` : '$';
}
