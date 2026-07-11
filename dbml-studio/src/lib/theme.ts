export const THEME_STORAGE_KEY = 'darkMode';

export function resolveDarkMode(storedValue: string | null, prefersDark: boolean): boolean {
	return storedValue === null ? prefersDark : storedValue === 'true';
}

export function applyDarkMode(root: { classList: Pick<DOMTokenList, 'toggle'> }, isDark: boolean) {
	root.classList.toggle('dark', isDark);
}
