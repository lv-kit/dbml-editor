import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { AUTH_SECRET: 'test-secret' }
}));

import { createPendingOrganizationCookie, verifyPendingOrganizationCookie } from './session';

describe('pending organization cookie', () => {
	it('accepts the cookie for the same user and organization', async () => {
		const cookie = await createPendingOrganizationCookie({ uid: 'uid-1', organizationId: 42 });

		expect(await verifyPendingOrganizationCookie(cookie, 'uid-1', 42)).toBe(true);
	});

	it('rejects a cookie for another user or organization', async () => {
		const cookie = await createPendingOrganizationCookie({ uid: 'uid-1', organizationId: 42 });

		expect(await verifyPendingOrganizationCookie(cookie, 'uid-2', 42)).toBe(false);
		expect(await verifyPendingOrganizationCookie(cookie, 'uid-1', 43)).toBe(false);
	});

	it('rejects a tampered cookie', async () => {
		const cookie = await createPendingOrganizationCookie({ uid: 'uid-1', organizationId: 42 });

		expect(await verifyPendingOrganizationCookie(`${cookie}tampered`, 'uid-1', 42)).toBe(false);
	});
});
