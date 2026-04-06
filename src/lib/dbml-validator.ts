import { Parser } from '@dbml/core';

export interface ValidationResult {
	valid: boolean;
	error: string | null;
}

export function validateDbml(content: string): ValidationResult {
	if (!content.trim()) {
		return { valid: false, error: 'DBML content is empty' };
	}

	try {
		const parser = new Parser();
		parser.parse(content, 'dbmlv2');
		return { valid: true, error: null };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown parse error';
		return { valid: false, error: message };
	}
}
