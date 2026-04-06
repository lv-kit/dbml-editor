import { describe, expect, it } from 'vitest';

import {
	canManageMembers,
	canChangeRole,
	canEditMemberRole,
	canRemoveMember,
	validateMemberRole,
	validateEmail,
	type MemberRole
} from './members';

describe('validateMemberRole', () => {
	it('accepts valid roles', () => {
		expect(validateMemberRole('owner')).toBe(true);
		expect(validateMemberRole('admin')).toBe(true);
		expect(validateMemberRole('member')).toBe(true);
	});

	it('rejects invalid roles', () => {
		expect(validateMemberRole('superadmin')).toBe(false);
		expect(validateMemberRole('')).toBe(false);
		expect(validateMemberRole('Owner')).toBe(false);
	});
});

describe('canManageMembers', () => {
	it('allows owner to manage members', () => {
		expect(canManageMembers('owner')).toBe(true);
	});

	it('allows admin to manage members', () => {
		expect(canManageMembers('admin')).toBe(true);
	});

	it('denies member from managing members', () => {
		expect(canManageMembers('member')).toBe(false);
	});
});

describe('canChangeRole', () => {
	it('allows owner to change any role', () => {
		expect(canChangeRole('owner', 'member', 'admin')).toBe(true);
		expect(canChangeRole('owner', 'admin', 'member')).toBe(true);
		expect(canChangeRole('owner', 'member', 'owner')).toBe(true);
	});

	it('allows admin to promote member to admin', () => {
		expect(canChangeRole('admin', 'member', 'admin')).toBe(true);
	});

	it('denies admin from promoting member to owner', () => {
		expect(canChangeRole('admin', 'member', 'owner')).toBe(false);
	});

	it('denies admin from changing admin role', () => {
		expect(canChangeRole('admin', 'admin', 'member')).toBe(false);
	});

	it('denies admin from changing owner role', () => {
		expect(canChangeRole('admin', 'owner', 'member')).toBe(false);
	});

	it('denies member from changing any role', () => {
		expect(canChangeRole('member', 'member', 'admin')).toBe(false);
		expect(canChangeRole('member', 'admin', 'member')).toBe(false);
	});
});

describe('canRemoveMember', () => {
	it('allows owner to remove member', () => {
		expect(canRemoveMember('owner', 'member')).toBe(true);
	});

	it('allows owner to remove admin', () => {
		expect(canRemoveMember('owner', 'admin')).toBe(true);
	});

	it('denies owner from removing another owner', () => {
		expect(canRemoveMember('owner', 'owner')).toBe(false);
	});

	it('allows admin to remove member', () => {
		expect(canRemoveMember('admin', 'member')).toBe(true);
	});

	it('denies admin from removing admin', () => {
		expect(canRemoveMember('admin', 'admin')).toBe(false);
	});

	it('denies admin from removing owner', () => {
		expect(canRemoveMember('admin', 'owner')).toBe(false);
	});

	it('denies member from removing anyone', () => {
		expect(canRemoveMember('member', 'member')).toBe(false);
		expect(canRemoveMember('member', 'admin')).toBe(false);
		expect(canRemoveMember('member', 'owner')).toBe(false);
	});
});

describe('canEditMemberRole', () => {
	it('allows owner to edit any role', () => {
		expect(canEditMemberRole('owner', 'member')).toBe(true);
		expect(canEditMemberRole('owner', 'admin')).toBe(true);
		expect(canEditMemberRole('owner', 'owner')).toBe(true);
	});

	it('allows admin to edit member role', () => {
		expect(canEditMemberRole('admin', 'member')).toBe(true);
	});

	it('denies admin from editing admin or owner roles', () => {
		expect(canEditMemberRole('admin', 'admin')).toBe(false);
		expect(canEditMemberRole('admin', 'owner')).toBe(false);
	});

	it('denies member from editing any role', () => {
		expect(canEditMemberRole('member', 'member')).toBe(false);
		expect(canEditMemberRole('member', 'admin')).toBe(false);
		expect(canEditMemberRole('member', 'owner')).toBe(false);
	});
});

describe('validateEmail', () => {
	it('accepts valid emails', () => {
		expect(validateEmail('user@example.com')).toBe(true);
		expect(validateEmail('test.user@domain.co.jp')).toBe(true);
	});

	it('rejects invalid emails', () => {
		expect(validateEmail('')).toBe(false);
		expect(validateEmail('invalid')).toBe(false);
		expect(validateEmail('no@domain')).toBe(false);
		expect(validateEmail('@domain.com')).toBe(false);
	});
});
