export type MemberRole = 'owner' | 'admin' | 'member';

const VALID_ROLES: MemberRole[] = ['owner', 'admin', 'member'];

export function validateMemberRole(role: string): role is MemberRole {
	return VALID_ROLES.includes(role as MemberRole);
}

export function canManageMembers(userRole: MemberRole): boolean {
	return userRole === 'owner' || userRole === 'admin';
}

export function canChangeRole(
	requestingUserRole: MemberRole,
	targetCurrentRole: MemberRole,
	newRole: MemberRole
): boolean {
	if (!canManageMembers(requestingUserRole)) return false;
	if (requestingUserRole === 'owner') return true;
	// admin can change member role, but cannot promote to owner
	if (requestingUserRole === 'admin') {
		return targetCurrentRole === 'member' && newRole !== 'owner';
	}
	return false;
}

export function canRemoveMember(
	requestingUserRole: MemberRole,
	targetRole: MemberRole
): boolean {
	if (!canManageMembers(requestingUserRole)) return false;
	// owner can remove anyone except other owners
	if (requestingUserRole === 'owner') return targetRole !== 'owner';
	// admin can remove members but not other admins or owners
	if (requestingUserRole === 'admin') return targetRole === 'member';
	return false;
}

export function canEditMemberRole(
	requestingUserRole: MemberRole,
	targetCurrentRole: MemberRole
): boolean {
	if (!canManageMembers(requestingUserRole)) return false;
	if (requestingUserRole === 'owner') return true;
	// admin can only edit members' roles, not other admins or owners
	if (requestingUserRole === 'admin') return targetCurrentRole === 'member';
	return false;
}

export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
