/**
 * File System Access API utilities for reading and writing local files.
 * Use `isFileSystemAccessSupported()` to detect browser support before calling
 * the API-dependent helpers in this module.
 */

export interface FileOpenResult {
	content: string;
	handle: FileSystemFileHandle;
	fileName: string;
}

export function isFileSystemAccessSupported(): boolean {
	return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

export async function openDbmlFile(): Promise<FileOpenResult> {
	if (!isFileSystemAccessSupported()) {
		throw new Error('File System Access API is not supported in this environment');
	}

	const [handle] = await window.showOpenFilePicker({
		types: [
			{
				description: 'DBML Files',
				accept: { 'text/plain': ['.dbml'] }
			}
		],
		multiple: false
	});

	const file = await handle.getFile();
	const content = await file.text();

	return { content, handle, fileName: file.name };
}

export async function writeToFileHandle(
	handle: FileSystemFileHandle,
	content: string
): Promise<void> {
	const writable = await handle.createWritable();
	try {
		await writable.write(content);
		await writable.close();
	} catch (error) {
		try {
			await writable.abort();
		} catch {
			// Ignore abort errors and rethrow the original write/close error.
		}

		throw error;
	}
}
