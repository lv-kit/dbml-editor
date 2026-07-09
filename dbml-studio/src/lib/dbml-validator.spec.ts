import { describe, expect, it } from 'vitest';

import { validateDbml } from './dbml-validator';

const VALID_DBML = `
Table users {
  id integer [pk]
  email varchar
}
`;

const VALID_DBML_WITH_REF = `
Table users {
  id integer [pk]
  email varchar
}

Table posts {
  id integer [pk]
  user_id integer
}

Ref: posts.user_id > users.id
`;

const INVALID_DBML = `
Table users {
  id integer [pk]
`;

describe('validateDbml', () => {
	it('returns valid for correct DBML with a single table', () => {
		const result = validateDbml(VALID_DBML);
		expect(result.valid).toBe(true);
		expect(result.error).toBeNull();
	});

	it('returns valid for correct DBML with tables and references', () => {
		const result = validateDbml(VALID_DBML_WITH_REF);
		expect(result.valid).toBe(true);
		expect(result.error).toBeNull();
	});

	it('returns invalid for malformed DBML', () => {
		const result = validateDbml(INVALID_DBML);
		expect(result.valid).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('returns invalid for empty content', () => {
		const result = validateDbml('');
		expect(result.valid).toBe(false);
		expect(result.error).toBe('DBMLの内容が空です');
	});

	it('returns invalid for whitespace-only content', () => {
		const result = validateDbml('   \n  \t  ');
		expect(result.valid).toBe(false);
		expect(result.error).toBe('DBMLの内容が空です');
	});
});
