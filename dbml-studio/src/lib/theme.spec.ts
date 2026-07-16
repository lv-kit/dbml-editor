import { describe, expect, it, vi } from 'vitest';

import { applyDarkMode, resolveDarkMode, resolveThemePreference } from './theme';

describe('resolveThemePreference', () => {
	it('uses the saved setting when one exists', () => {
		expect(resolveThemePreference('dark', null)).toBe('dark');
	});

	it('migrates the legacy boolean setting', () => {
		expect(resolveThemePreference(null, 'true')).toBe('dark');
		expect(resolveThemePreference(null, 'false')).toBe('light');
	});

	it('uses the system theme when no setting is saved', () => {
		expect(resolveThemePreference(null, null)).toBe('system');
	});
});

describe('resolveDarkMode', () => {
	it('uses the selected theme', () => {
		expect(resolveDarkMode('light', true)).toBe(false);
		expect(resolveDarkMode('dark', false)).toBe(true);
	});

	it('uses the system preference for the system theme', () => {
		expect(resolveDarkMode('system', true)).toBe(true);
		expect(resolveDarkMode('system', false)).toBe(false);
	});
});

describe('applyDarkMode', () => {
	it('updates the root dark class', () => {
		const toggle = vi.fn();

		applyDarkMode({ classList: { toggle } }, true);

		expect(toggle).toHaveBeenCalledWith('dark', true);
	});
});
