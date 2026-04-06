import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { SvelteKitAuth } from '@auth/sveltekit';
import type { Provider, ProviderId } from '@auth/core/providers';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id';
import Resend from '@auth/core/providers/resend';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

type ProviderAvailability = { id: ProviderId; name: string; ready: boolean };

type EnvSource = Record<string, string | undefined>;

const providerDefinitions = [
	{
		id: 'github' as const satisfies ProviderId,
		name: 'GitHub',
		clientIdKey: 'GITHUB_ID',
		clientSecretKey: 'GITHUB_SECRET',
		create: (clientId: string, clientSecret: string) => GitHub({ clientId, clientSecret })
	},
	{
		id: 'google' as const satisfies ProviderId,
		name: 'Google',
		clientIdKey: 'GOOGLE_CLIENT_ID',
		clientSecretKey: 'GOOGLE_CLIENT_SECRET',
		create: (clientId: string, clientSecret: string) => Google({ clientId, clientSecret })
	},
	{
		id: 'microsoft-entra-id' as const satisfies ProviderId,
		name: 'Microsoft',
		clientIdKey: 'MICROSOFT_ENTRA_ID_CLIENT_ID',
		clientSecretKey: 'MICROSOFT_ENTRA_ID_CLIENT_SECRET',
		create: (clientId: string, clientSecret: string, source: EnvSource) => {
			const config: any = {
				clientId,
				clientSecret
			};
			const tenantId = source.MICROSOFT_ENTRA_ID_TENANT;
			if (tenantId) {
				config.tenantId = tenantId;
			}
			return MicrosoftEntraID(config);
		}
	},
	{
		id: 'resend' as const satisfies ProviderId,
		name: 'Email',
		clientIdKey: 'RESEND_API_KEY',
		clientSecretKey: 'RESEND_API_KEY',
		create: (clientId: string) =>
			Resend({
				apiKey: clientId,
				from: 'noreply@dbml-editor.com'
			})
	}
] satisfies Array<{
	id: ProviderId;
	name: string;
	clientIdKey: string;
	clientSecretKey: string;
	create: (clientId: string, clientSecret: string, source: EnvSource) => Provider;
}>;

function resolveEnv(source?: RequestEvent) {
	return (source?.platform?.env as EnvSource | undefined) ?? env;
}

export function getProviderAvailability(event?: RequestEvent): ProviderAvailability[] {
	const source = resolveEnv(event);

	return providerDefinitions.map(({ id, name, clientIdKey, clientSecretKey }) => ({
		id,
		name,
		ready: Boolean(source[clientIdKey] && source[clientSecretKey])
	}));
}

function buildProviders(event?: RequestEvent) {
	const source = resolveEnv(event);

	return providerDefinitions
		.map(({ clientIdKey, clientSecretKey, create }) => {
			const clientId = source[clientIdKey];
			const clientSecret = source[clientSecretKey];

			if (!clientId || !clientSecret) return null;

			return create(clientId, clientSecret, source);
		})
		.filter((provider): provider is NonNullable<typeof provider> => Boolean(provider));
}

function resolveSecret(event?: RequestEvent) {
	const source = resolveEnv(event);
	if (source.AUTH_SECRET) return source.AUTH_SECRET;
	if (source.NODE_ENV === 'production') {
		throw new Error('AUTH_SECRET must be set in production');
	}
	return 'dev-secret';
}

function resolveTrustHost(event?: RequestEvent) {
	const source = resolveEnv(event);
	const trustHost = source.AUTH_TRUST_HOST;

	if (trustHost === 'true') return true;
	if (trustHost === 'false') return false;

	return source.NODE_ENV !== 'production';
}

export const { handle, signIn, signOut} = SvelteKitAuth(async (event) => {
	const providers = buildProviders(event);

	return {
		providers,
		secret: resolveSecret(event),
		trustHost: resolveTrustHost(event),
		callbacks: {
			async signIn({ user: authUser }: any) {
				// Allow sign in if user has email
				return Boolean(authUser?.email);
			},
			async redirect({ url, baseUrl }: any) {
				// If callback URL is provided, use it
				if (url.startsWith(baseUrl)) return url;
				// Otherwise redirect to signup flow
				return `${baseUrl}/signup`;
			}
		}
	} as any;
});
