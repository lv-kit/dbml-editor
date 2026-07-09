import { beforeEach, describe, expect, it, vi } from 'vitest';

const tauriMocks = vi.hoisted(() => ({
	open: vi.fn(),
	save: vi.fn(),
	readTextFile: vi.fn(),
	writeTextFile: vi.fn()
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
	open: tauriMocks.open,
	save: tauriMocks.save
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
	readTextFile: tauriMocks.readTextFile,
	writeTextFile: tauriMocks.writeTextFile
}));

import {
	ensureDbmlExtension,
	getFileName,
	openDbmlFile,
	saveDbmlFile,
	saveDbmlFileAs
} from './file-system';

describe('file-system', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('extracts file names from unix and windows paths', () => {
		expect(getFileName('/tmp/schema.dbml')).toBe('schema.dbml');
		expect(getFileName('C:\\tmp\\schema.dbml')).toBe('schema.dbml');
	});

	it('adds dbml extension when missing', () => {
		expect(ensureDbmlExtension('/tmp/schema')).toBe('/tmp/schema.dbml');
		expect(ensureDbmlExtension('/tmp/schema.DBML')).toBe('/tmp/schema.DBML');
	});

	it('opens a selected dbml file', async () => {
		tauriMocks.open.mockResolvedValue('/tmp/schema.dbml');
		tauriMocks.readTextFile.mockResolvedValue('Table users {}');

		const document = await openDbmlFile();

		expect(tauriMocks.open).toHaveBeenCalledWith({
			multiple: false,
			directory: false,
			filters: [{ name: 'DBML', extensions: ['dbml'] }]
		});
		expect(tauriMocks.readTextFile).toHaveBeenCalledWith('/tmp/schema.dbml');
		expect(document).toEqual({
			content: 'Table users {}',
			path: '/tmp/schema.dbml',
			fileName: 'schema.dbml'
		});
	});

	it('returns null when open dialog is cancelled', async () => {
		tauriMocks.open.mockResolvedValue(null);

		await expect(openDbmlFile()).resolves.toBeNull();
		expect(tauriMocks.readTextFile).not.toHaveBeenCalled();
	});

	it('writes dbml content to an existing file path', async () => {
		await expect(saveDbmlFile('/tmp/schema', 'Table users {}')).resolves.toBe('/tmp/schema.dbml');

		expect(tauriMocks.writeTextFile).toHaveBeenCalledWith('/tmp/schema.dbml', 'Table users {}');
	});

	it('saves dbml content through a save dialog', async () => {
		tauriMocks.save.mockResolvedValue('/tmp/schema');

		const document = await saveDbmlFileAs('Table users {}', 'schema.dbml');

		expect(tauriMocks.save).toHaveBeenCalledWith({
			defaultPath: 'schema.dbml',
			filters: [{ name: 'DBML', extensions: ['dbml'] }]
		});
		expect(tauriMocks.writeTextFile).toHaveBeenCalledWith('/tmp/schema.dbml', 'Table users {}');
		expect(document).toEqual({
			content: 'Table users {}',
			path: '/tmp/schema.dbml',
			fileName: 'schema.dbml'
		});
	});

	it('returns null when save dialog is cancelled', async () => {
		tauriMocks.save.mockResolvedValue(null);

		await expect(saveDbmlFileAs('Table users {}')).resolves.toBeNull();
		expect(tauriMocks.writeTextFile).not.toHaveBeenCalled();
	});
});
