export type Serializable =
	| string
	| number
	| boolean
	| null
	| Serializable[]
	| { [key: string]: Serializable };

export type ZodVersion = 'v3' | 'v4';
