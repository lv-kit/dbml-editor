import { describe, expect, it } from 'vitest';

import { applyLocale, resolveLocale } from './i18n';

describe('resolveLocale', () => {
	it('uses a valid saved locale', () => {
		expect(resolveLocale('es', 'ja-JP')).toBe('es');
	});

	it('uses the browser language when there is no saved locale', () => {
		expect(resolveLocale(null, 'en-US')).toBe('en');
	});

	it('falls back to Japanese for unsupported languages', () => {
		expect(resolveLocale(null, 'fr-FR')).toBe('ja');
	});
});

describe('applyLocale', () => {
	it('updates the document language', () => {
		const root = { lang: '' };

		applyLocale(root, 'es');

		expect(root.lang).toBe('es');
	});
});
