import { isTauri } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export interface DbmlDocument {
	content: string;
	path: string | null;
	fileName: string;
}

const DBML_FILTER = {
	name: 'DBML',
	extensions: ['dbml']
};

export function getFileName(path: string): string {
	const normalized = path.replaceAll('\\', '/');
	return normalized.split('/').pop() || 'untitled.dbml';
}

export function ensureDbmlExtension(path: string): string {
	return path.toLowerCase().endsWith('.dbml') ? path : `${path}.dbml`;
}

export function isTauriRuntime(): boolean {
	return isTauri();
}

export async function openDbmlFile(): Promise<DbmlDocument | null> {
	if (!isTauriRuntime()) {
		throw new Error('Tauri環境ではないため、ネイティブファイルダイアログを使用できません');
	}

	const selected = await open({
		multiple: false,
		directory: false,
		filters: [DBML_FILTER]
	});

	if (!selected || Array.isArray(selected)) return null;

	const content = await readTextFile(selected);
	return {
		content,
		path: selected,
		fileName: getFileName(selected)
	};
}

export async function readBrowserDbmlFile(file: File): Promise<DbmlDocument> {
	return {
		content: await file.text(),
		path: null,
		fileName: file.name || 'untitled.dbml'
	};
}

export async function saveDbmlFile(path: string, content: string): Promise<string> {
	const targetPath = ensureDbmlExtension(path);
	await writeTextFile(targetPath, content);
	return targetPath;
}

export async function saveDbmlFileAs(
	content: string,
	defaultPath = 'untitled.dbml'
): Promise<DbmlDocument | null> {
	const selected = await save({
		defaultPath: ensureDbmlExtension(defaultPath),
		filters: [DBML_FILTER]
	});

	if (!selected) return null;

	const targetPath = await saveDbmlFile(selected, content);
	return {
		content,
		path: targetPath,
		fileName: getFileName(targetPath)
	};
}
