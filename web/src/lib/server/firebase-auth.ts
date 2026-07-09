import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const FIREBASE_JWKS_URL =
	'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJWKS() {
	if (!jwks) {
		jwks = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
	}
	return jwks;
}

export interface FirebaseTokenPayload {
	uid: string;
	email: string;
	name?: string;
	provider?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseTokenPayload> {
	const projectId = env.FIREBASE_PROJECT_ID;
	if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not set');

	const { payload } = await jwtVerify(idToken, getJWKS(), {
		issuer: `https://securetoken.google.com/${projectId}`,
		audience: projectId
	});

	const email = payload['email'] as string | undefined;
	if (!email) throw new Error('Token does not contain email');

	// Extract provider from firebase sign-in info
	const firebasePayload = payload['firebase'] as
		| { sign_in_provider?: string; identities?: Record<string, unknown> }
		| undefined;
	const provider = firebasePayload?.sign_in_provider;

	return {
		uid: payload.sub as string,
		email: email.trim().toLowerCase(),
		name: payload['name'] as string | undefined,
		provider
	};
}
