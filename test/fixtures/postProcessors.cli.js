export const postProcessors = [
	(builder, ctx) => {
		if (
			ctx.matchPath('$..id') &&
			ctx.path.length > 0 &&
			ctx.path[ctx.path.length - 1] === 'id' &&
			typeof builder.brand === 'function'
		) {
			return builder.brand('CLI');
		}
		return undefined;
	},
];
