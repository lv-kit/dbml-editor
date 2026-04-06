import { describe, expect, it, vi } from 'vitest';

import { isFileSystemAccessSupported, writeToFileHandle } from './file-system';

describe('isFileSystemAccessSupported', () => {
	it('returns false when showOpenFilePicker is not available', () => {
		// In Node test environment, window.showOpenFilePicker is not available
		const result = isFileSystemAccessSupported();
		expect(result).toBe(false);
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
});
