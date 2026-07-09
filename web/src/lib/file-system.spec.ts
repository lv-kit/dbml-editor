import { afterEach, describe, expect, it, vi } from 'vitest';

import { isFileSystemAccessSupported, openDbmlFile, writeToFileHandle } from './file-system';

describe('isFileSystemAccessSupported', () => {
	it('returns false when showOpenFilePicker is not available', () => {
		// In Node test environment, window.showOpenFilePicker is not available
		const result = isFileSystemAccessSupported();
		expect(result).toBe(false);
	});
});

describe('openDbmlFile', () => {
	const originalWindow = globalThis.window;

	afterEach(() => {
		vi.restoreAllMocks();
		if (originalWindow === undefined) {
			// @ts-expect-error restoring undefined window in Node
			delete globalThis.window;
		}
	});

	it('throws when File System Access API is not supported', async () => {
		await expect(openDbmlFile()).rejects.toThrow(
			'このブラウザではFile System Access APIがサポートされていません'
		);
	});

	it('reads file content and returns handle', async () => {
		const mockFile = new File(['Table users { id integer [pk] }'], 'schema.dbml', {
			type: 'text/plain'
		});
		const mockHandle = {
			getFile: vi.fn().mockResolvedValue(mockFile)
		} as unknown as FileSystemFileHandle;

		const mockPicker = vi.fn().mockResolvedValue([mockHandle]);
		// @ts-expect-error mocking window for Node environment
		globalThis.window = { showOpenFilePicker: mockPicker };

		const result = await openDbmlFile();

		expect(result.content).toBe('Table users { id integer [pk] }');
		expect(result.handle).toBe(mockHandle);
		expect(result.fileName).toBe('schema.dbml');
	});

	it('propagates AbortError when user cancels the picker', async () => {
		const abortError = new DOMException('The user aborted a request.', 'AbortError');
		const mockPicker = vi.fn().mockRejectedValue(abortError);
		// @ts-expect-error mocking window for Node environment
		globalThis.window = { showOpenFilePicker: mockPicker };

		await expect(openDbmlFile()).rejects.toThrow(abortError);
	});
});

describe('writeToFileHandle', () => {
	it('writes content through the writable stream', async () => {
		const mockWritable = {
			write: vi.fn().mockResolvedValue(undefined),
			close: vi.fn().mockResolvedValue(undefined)
		};
		const mockHandle = {
			createWritable: vi.fn().mockResolvedValue(mockWritable)
		} as unknown as FileSystemFileHandle;

		await writeToFileHandle(mockHandle, 'Table users { id integer [pk] }');

		expect(mockHandle.createWritable).toHaveBeenCalledOnce();
		expect(mockWritable.write).toHaveBeenCalledWith('Table users { id integer [pk] }');
		expect(mockWritable.close).toHaveBeenCalledOnce();
	});

	it('closes the writable stream when writing empty content', async () => {
		const mockWritable = {
			write: vi.fn().mockResolvedValue(undefined),
			close: vi.fn().mockResolvedValue(undefined)
		};
		const mockHandle = {
			createWritable: vi.fn().mockResolvedValue(mockWritable)
		} as unknown as FileSystemFileHandle;

		await writeToFileHandle(mockHandle, '');

		expect(mockWritable.write).toHaveBeenCalledWith('');
		expect(mockWritable.close).toHaveBeenCalledOnce();
	});

	it('aborts the writable stream when write fails', async () => {
		const writeError = new Error('Disk full');
		const mockWritable = {
			write: vi.fn().mockRejectedValue(writeError),
			close: vi.fn().mockResolvedValue(undefined),
			abort: vi.fn().mockResolvedValue(undefined)
		};
		const mockHandle = {
			createWritable: vi.fn().mockResolvedValue(mockWritable)
		} as unknown as FileSystemFileHandle;

		await expect(writeToFileHandle(mockHandle, 'content')).rejects.toThrow('Disk full');

		expect(mockWritable.abort).toHaveBeenCalledOnce();
		expect(mockWritable.close).not.toHaveBeenCalled();
	});
});
