// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SessionPayload } from '$lib/server/session';

declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			session: SessionPayload | null;
		}
		interface PageData {
			firebaseConfig?: {
				apiKey: string;
				authDomain: string;
				projectId: string;
				appId: string;
			};
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
