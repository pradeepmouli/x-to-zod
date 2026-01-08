import type { PostProcessor } from '../Types.js';
import { is } from '../utils/is.js';

function guardAndApply(
	predicate: (builder: unknown) => boolean,
	transform: (builder: any) => any,
): PostProcessor {
	return (builder) => (predicate(builder) ? transform(builder) : undefined);
}

function whenPath(pattern: string, transform: PostProcessor): PostProcessor {
	return (builder, context) =>
		context.matchPath(pattern) ? transform(builder, context) : undefined;
}

export const postProcessors = {
	strictObjects: (): PostProcessor =>
		guardAndApply(is.objectBuilder, (builder) => builder.strict()),

	nonemptyArrays: (): PostProcessor =>
		guardAndApply(is.arrayBuilder, (builder) => builder.min(1)),

	brandIds: (brand: string = 'ID'): PostProcessor =>
		(builder, context) => {
			if (
				context.path.length > 0 &&
				context.path[context.path.length - 1] === 'id' &&
				is.stringBuilder(builder)
			) {
				return builder.brand(brand);
			}
			return undefined;
		},

	makeOptional: (pattern: string): PostProcessor =>
		whenPath(pattern, (builder) => builder.optional()),

	makeRequired: (pattern: string): PostProcessor =>
		whenPath(pattern, (builder) => {
			if (is.zodBuilder(builder)) {
				builder.required?.();
			}
			return builder;
		}),

	matchPath: (pattern: string, transform: PostProcessor): PostProcessor =>
		whenPath(pattern, transform),
};
