import { describe, expect, it, vi } from 'vitest';

import { applyDarkMode, resolveDarkMode } from './theme';

describe('resolveDarkMode', () => {
	it('uses the saved setting when one exists', () => {
		expect(resolveDarkMode('true', false)).toBe(true);
		expect(resolveDarkMode('false', true)).toBe(false);
	});

	it('uses the system preference when no setting is saved', () => {
		expect(resolveDarkMode(null, true)).toBe(true);
		expect(resolveDarkMode(null, false)).toBe(false);
	});
});

describe('applyDarkMode', () => {
	it('updates the root dark class', () => {
		const toggle = vi.fn();

		applyDarkMode({ classList: { toggle } }, true);

		expect(toggle).toHaveBeenCalledWith('dark', true);
	});
});
