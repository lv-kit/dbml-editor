/**
 * File System Access API utilities for reading and writing local files.
 * Falls back gracefully when the API is not supported.
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
	await writable.write(content);
	await writable.close();
}
