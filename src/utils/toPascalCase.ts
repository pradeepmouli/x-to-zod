/**
 * Convert a string to PascalCase.
 * Handles kebab-case, snake_case, dot.case, and path/separators.
 */
export function toPascalCase(str: string): string {
	return str
		.replace(/[-_./]/g, ' ')
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}
