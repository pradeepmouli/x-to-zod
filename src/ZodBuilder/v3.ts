import { z } from 'zod';
import {
	StringBuilder,
	NumberBuilder,
	BooleanBuilder,
	ObjectBuilder,
	ArrayBuilder,
	BigIntBuilder,
	DateBuilder,
} from './builders';

const buildV3 = {
	string: (params?: Parameters<typeof z.string>[0]) =>
		new StringBuilder(params, 'v3'),
	number: (params?: Parameters<typeof z.number>[0]) =>
		new NumberBuilder(params, 'v3'),
	boolean: (params?: Parameters<typeof z.boolean>[0]) =>
		new BooleanBuilder(params, 'v3'),
	object: (params?: Parameters<typeof z.object>[0]) =>
		new ObjectBuilder(params, 'v3'),
	array: (params?: Parameters<typeof z.array>[0]) =>
		new ArrayBuilder(params, 'v3'),
	bigint: (params?: Parameters<typeof z.bigint>[0]) =>
		new BigIntBuilder(params, 'v3'),
	date: (params?: Parameters<typeof z.date>[0]) =>
		new DateBuilder(params, 'v3'),
	// ...other factory methods...
};

export { buildV3 };
