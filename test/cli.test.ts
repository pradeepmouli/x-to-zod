import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const tsxBin = './node_modules/.bin/tsx';
const CLI_TIMEOUT_MS = 15000;

function runCli(args: string[], options?: { input?: string }) {
	const result = spawnSync(tsxBin, ['src/cli.ts', ...args], {
		encoding: 'utf8',
		timeout: CLI_TIMEOUT_MS,
		...(options?.input !== undefined ? { input: options.input } : {}),
	});

	if (result.error) {
		throw result.error;
	}

	return result;
}

describe('cli', () => {
	it('runs cli (help)', () => {
		const { stdout, status } = runCli(['-h']);
		expect(status).toBe(0);
		expect(stdout.includes('--input')).toBeTruthy();
	});

	it('runs cli (input only)', () => {
		const { stderr, status } = runCli(['-i', 'test/all.json']);
		expect(status).toBe(0);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (noImport)', () => {
		const { stderr, status } = runCli(['-i', 'test/all.json', '--noImport']);
		expect(status).toBe(0);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (stdin only)', () => {
		const { stderr, status } = runCli([], { input: '{"type": "any"}' });
		expect(status).toBe(0);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (output)', () => {
		const { stderr, status } = runCli([
			'--output',
			'test/output/output.js',
			'-i',
			'test/all.json',
		]);
		expect(status).toBe(0);
		expect(!stderr).toBeTruthy();
	});

	it('runs cli (output with depth)', () => {
		const { stderr, status } = runCli([
			'--output',
			'test/output/output.js',
			'-i',
			'test/all.json',
			'-d',
			'2',
		]);
		expect(status).toBe(0);
		expect(!stderr).toBeTruthy();
	});

	it('cli should err with with missing input', () => {
		const { stderr, status } = runCli(['--output', 'test/output/output.js']);
		expect(status).not.toBe(0);
		expect(stderr.includes('Unexpected end of JSON input')).toBeTruthy();
	});

	it('cli should err with with bad depth', () => {
		const { stderr, status } = runCli([
			'--output',
			'test/output/output.js',
			'-i',
			'test/all.json',
			'-d',
			'abc',
		]);
		expect(status).not.toBe(0);
		expect(
			stderr.includes('Value of argument depth must be a valid number'),
		).toBeTruthy();
	});

	it('cli should err with with missing depth', () => {
		const { stderr, status } = runCli([
			'--output',
			'test/output/output.js',
			'-i',
			'test/all.json',
			'-d',
		]);
		expect(status).not.toBe(0);
		expect(stderr.includes('Expected a value for argument depth')).toBeTruthy();
	});

	it('cli should err with bad array value', () => {
		const { stderr, status } = runCli([
			'--output',
			'test/output/output.js',
			'-i',
			'test/all.json',
			'-m',
			'notAModule',
		]);
		expect(status).not.toBe(0);
		expect(
			stderr.includes('Value of argument module must be one of esm,cjs,none'),
		).toBeTruthy();
	});

	it('loads post-processors module via CLI flag', () => {
		const { stdout, stderr, status } = runCli(
			['--postProcessors', 'test/fixtures/postProcessors.cli.js'],
			{
				input: '{"type":"object","properties":{"id":{"type":"string"}}}',
			},
		);
		expect(status).toBe(0);
		expect(stderr || '').toBe('');
		// Verify post-processor was loaded and applied to id field
		expect(stdout).toContain('id');
		expect(stdout).toContain('.brand("CLI")');
	});

	it('project mode: error without --out flag', () => {
		const { stderr, status } = runCli([
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
		]);
		expect(status).not.toBe(0);
		expect(stderr).toContain('--out flag is required in project mode');
	});

	it('project mode: error without --schemas flag', () => {
		const { stderr, status } = runCli([
			'--project',
			'--out',
			'/tmp/test-project',
		]);
		expect(status).not.toBe(0);
		expect(stderr).toContain('--schemas flag is required in project mode');
	});

	it('project mode: invalid module-format', () => {
		const { stderr, status } = runCli([
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
			'--out',
			'/tmp/test-project-invalid-format',
			'--moduleFormat',
			'invalid',
		]);
		expect(status).not.toBe(0);
		expect(stderr).toContain(
			'Value of argument moduleFormat must be one of esm,cjs,both',
		);
	});

	it('project mode: invalid zod-version', () => {
		const { stderr, status } = runCli([
			'--project',
			'--schemas',
			'test/fixtures/cli-project/user.json',
			'--out',
			'/tmp/test-project-invalid-zv',
			'--zodVersion',
			'v2',
		]);
		expect(status).not.toBe(0);
		expect(stderr).toContain(
			'Value of argument zodVersion must be one of v3,v4',
		);
	});

	it('project mode: expands glob patterns with real schema matches', () => {
		const outDir = mkdtempSync(join(tmpdir(), 'x-to-zod-cli-'));

		try {
			const { stderr, status } = runCli([
				'--project',
				'--schemas',
				'test/fixtures/cli-project/*.json',
				'--out',
				outDir,
			]);

			expect(status).toBe(0);
			expect(stderr || '').toBe('');
			expect(
				existsSync(join(outDir, 'test/fixtures/cli-project/user.json.ts')),
			).toBe(true);
			expect(
				existsSync(join(outDir, 'test/fixtures/cli-project/post.json.ts')),
			).toBe(true);
			expect(existsSync(join(outDir, 'index.ts'))).toBe(true);
		} finally {
			rmSync(outDir, { recursive: true, force: true });
		}
	});
});
