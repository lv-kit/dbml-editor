import { SignJWT, jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';

const COOKIE_NAME = 'session';
const PENDING_ORGANIZATION_COOKIE_NAME = 'pending_organization';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PENDING_ORGANIZATION_DURATION_SECONDS = 60 * 10;

export interface SessionPayload {
	uid: string;
	email: string;
	name?: string;
	provider?: string;
}

interface PendingOrganizationPayload {
	uid: string;
	organizationId: number;
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

export async function createPendingOrganizationCookie(
	payload: PendingOrganizationPayload
): Promise<string> {
	const token = await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${PENDING_ORGANIZATION_DURATION_SECONDS}s`)
		.sign(getSecret());
	return token;
}

export async function verifyPendingOrganizationCookie(
	cookie: string,
	uid: string,
	organizationId: number
): Promise<boolean> {
	try {
		const { payload } = await jwtVerify(cookie, getSecret());
		return payload['uid'] === uid && payload['organizationId'] === organizationId;
	} catch {
		return false;
	}
}

export {
	COOKIE_NAME,
	PENDING_ORGANIZATION_COOKIE_NAME,
	PENDING_ORGANIZATION_DURATION_SECONDS,
	SESSION_DURATION_SECONDS
};
