export const THEME_STORAGE_KEY = 'themePreference';
export const LEGACY_THEME_STORAGE_KEY = 'darkMode';

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export function resolveThemePreference(
	storedValue: string | null,
	legacyStoredValue: string | null
): ThemePreference {
	if (isThemePreference(storedValue)) return storedValue;
	if (legacyStoredValue === 'true') return 'dark';
	if (legacyStoredValue === 'false') return 'light';
	return 'system';
}

export function resolveDarkMode(preference: ThemePreference, prefersDark: boolean): boolean {
	if (preference === 'system') return prefersDark;
	return preference === 'dark';
}

export function isThemePreference(value: string | null): value is ThemePreference {
	return typeof value === 'string' && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function applyDarkMode(root: { classList: Pick<DOMTokenList, 'toggle'> }, isDark: boolean) {
	root.classList.toggle('dark', isDark);
}
