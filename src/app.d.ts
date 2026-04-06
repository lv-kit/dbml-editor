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
}

export {};
