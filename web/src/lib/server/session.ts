import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const COOKIE_NAME = 'session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
	uid: string;
	email: string;
	name?: string;
	provider?: string;
}

function getSecret(): Uint8Array {
	const secret = env.AUTH_SECRET;
	if (!secret) throw new Error('AUTH_SECRET is not set');
	return new TextEncoder().encode(secret);
}

export async function createSessionCookie(payload: SessionPayload): Promise<string> {
	const token = await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
		.sign(getSecret());
	return token;
}

export async function verifySessionCookie(cookie: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(cookie, getSecret());
		return {
			uid: payload['uid'] as string,
			email: payload['email'] as string,
			name: payload['name'] as string | undefined,
			provider: payload['provider'] as string | undefined
		};
	} catch {
		return null;
	}
}

export { COOKIE_NAME, SESSION_DURATION_SECONDS };
