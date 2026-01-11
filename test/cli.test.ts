import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';

const tsxBin = './node_modules/.bin/tsx';

describe('cli', () => {
	it('runs cli (help)', () => {
		const { stdout } = spawnSync(tsxBin, ['src/cli.ts', '-h'], {
			encoding: 'utf8',
		});
		expect(stdout.includes('--input')).toBeTruthy();
	});

	it('runs cli (input only)', () => {
		const { stderr } = spawnSync(
			tsxBin,
			['src/cli.ts', '-i', 'test/all.json'],
			{
				encoding: 'utf8',
			},
		);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (noImport)', () => {
		const { stderr } = spawnSync(
			tsxBin,
			['src/cli.ts', '-i', 'test/all.json', '--noImport'],
			{
				encoding: 'utf8',
			},
		);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (stdin only)', () => {
		const { stderr } = spawnSync(tsxBin, ['src/cli.ts'], {
			input: '{"type": "any"}',
			encoding: 'utf8',
		});
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (output)', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--output',
				'test/output/output.js',
				'-i',
				'test/all.json',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (output with depth)', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--output',
				'test/output/output.js',
				'-i',
				'test/all.json',
				'-d',
				'2',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(!stderr).toBeTruthy();
	});

	it('cli should err with with missing input', () => {
		const { stderr } = spawnSync(
			tsxBin,
			['src/cli.ts', '--output', 'test/output/output.js'],
			{
				encoding: 'utf8',
			},
		);
		expect(stderr.includes('Unexpected end of JSON input')).toBeTruthy();
	});

	it('cli should err with with bad depth', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--output',
				'test/output/output.js',
				'-i',
				'test/all.json',
				'-d',
				'abc',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(
			stderr.includes('Value of argument depth must be a valid number'),
		).toBeTruthy();
	});

	it('cli should err with with missing depth', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--output',
				'test/output/output.js',
				'-i',
				'test/all.json',
				'-d',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(stderr.includes('Expected a value for argument depth')).toBeTruthy();
	});

	it('cli should err with bad array value', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--output',
				'test/output/output.js',
				'-i',
				'test/all.json',
				'-m',
				'notAModule',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(
			stderr.includes('Value of argument module must be one of esm,cjs,none'),
		).toBeTruthy();
	});

	it('loads post-processors module via CLI flag', () => {
		const { stdout, stderr } = spawnSync(
			tsxBin,
			['src/cli.ts', '--postProcessors', 'test/fixtures/postProcessors.cli.js'],
			{
				input: '{"type":"object","properties":{"id":{"type":"string"}}}',
				encoding: 'utf8',
			},
		);
		expect(stderr || '').toBe('');
		// Verify post-processor was loaded and applied to id field
		expect(stdout).toContain('id');
		expect(stdout).toContain('.brand("CLI")');
	});

	it('project mode: error without --out flag', () => {
		const { stderr } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--project',
				'--schemas',
				'test/fixtures/cli-project/user.json',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(stderr).toContain('--out flag is required in project mode');
	});

	it('project mode: error without --schemas flag', () => {
		const { stderr } = spawnSync(
			tsxBin,
			['src/cli.ts', '--project', '--out', '/tmp/test-project'],
			{
				encoding: 'utf8',
			},
		);
		expect(stderr).toContain('--schemas flag is required in project mode');
	});

	it('project mode: invalid module-format', () => {
		const { stderr, status } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--project',
				'--schemas',
				'test/fixtures/cli-project/user.json',
				'--out',
				'/tmp/test-project-invalid-format',
				'--moduleFormat',
				'invalid',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(status).not.toBe(0);
	});

	it('project mode: invalid zod-version', () => {
		const { stderr, status } = spawnSync(
			tsxBin,
			[
				'src/cli.ts',
				'--project',
				'--schemas',
				'test/fixtures/cli-project/user.json',
				'--out',
				'/tmp/test-project-invalid-zv',
				'--zodVersion',
				'v2',
			],
			{
				encoding: 'utf8',
			},
		);
		expect(status).not.toBe(0);
	});
});

it('project mode: error without --out flag', () => {
	const { stderr } = spawnSync(
		tsxBin,
		[
			'src/cli.ts',
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
		],
		{
			encoding: 'utf8',
		},
	);
	expect(stderr).toContain('--out flag is required in project mode');
});

it('project mode: error without --schemas flag', () => {
	const { stderr } = spawnSync(
		tsxBin,
		['src/cli.ts', '--project', '--out', '/tmp/test-project'],
		{
			encoding: 'utf8',
		},
	);
	expect(stderr).toContain('--schemas flag is required in project mode');
});

it('project mode: invalid module-format', () => {
	const { status } = spawnSync(
		tsxBin,
		[
			'src/cli.ts',
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
			'--out',
			'/tmp/test-project-invalid-format-1',
			'--moduleFormat',
			'invalid',
		],
		{
			encoding: 'utf8',
		},
	);
	expect(status).not.toBe(0);
});

it('project mode: invalid zod-version', () => {
	const { status } = spawnSync(
		tsxBin,
		[
			'src/cli.ts',
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
			'--out',
			'/tmp/test-project-invalid-zv-1',
			'--zodVersion',
			'v2',
		],
		{
			encoding: 'utf8',
		},
	);
	expect(status).not.toBe(0);
});
