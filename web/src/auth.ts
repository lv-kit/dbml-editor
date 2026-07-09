import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

type EnvSource = Record<string, string | undefined>;

export interface ProviderAvailability {
	id: string;
	name: string;
	ready: boolean;
}

function resolveEnv(event?: RequestEvent): EnvSource {
	return (event?.platform?.env as EnvSource | undefined) ?? (env as EnvSource);
}

export function getFirebaseConfig(event?: RequestEvent) {
	const source = resolveEnv(event);
	return {
		apiKey: source.FIREBASE_API_KEY ?? '',
		authDomain: source.FIREBASE_AUTH_DOMAIN ?? '',
		projectId: source.FIREBASE_PROJECT_ID ?? '',
		appId: source.FIREBASE_APP_ID ?? ''
	};
}

export function getProviderAvailability(event?: RequestEvent): ProviderAvailability[] {
	const source = resolveEnv(event);

	return [
		{
			id: 'google',
			name: 'Google',
			ready: Boolean(source.FIREBASE_GOOGLE_ENABLED !== 'false' && source.FIREBASE_API_KEY)
		},
		{
			id: 'microsoft',
			name: 'Microsoft',
			ready: Boolean(source.FIREBASE_MICROSOFT_ENABLED === 'true' && source.FIREBASE_API_KEY)
		},
		{
			id: 'email',
			name: 'Email',
			ready: Boolean(source.FIREBASE_EMAIL_ENABLED !== 'false' && source.FIREBASE_API_KEY)
		}
	];
}
