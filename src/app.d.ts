/// <reference types="@auth/sveltekit" />
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '@auth/core/types';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		interface PageData {
			session?: Session | null;
			providers?: { id: string; name: string; ready: boolean }[];
		}
		// interface PageState {}
	}

	// File System Access API
	interface FileSystemFileHandle {
		getFile(): Promise<File>;
		createWritable(): Promise<FileSystemWritableFileStream>;
	}

	interface FileSystemWritableFileStream extends WritableStream {
		write(data: string | ArrayBuffer | Blob | DataView): Promise<void>;
		close(): Promise<void>;
		abort(): Promise<void>;
	}

	interface FilePickerAcceptType {
		description?: string;
		accept: Record<string, string[]>;
	}

	interface OpenFilePickerOptions {
		types?: FilePickerAcceptType[];
		multiple?: boolean;
	}

	interface Window {
		showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
	}
}

export {};
