import { describe, expect, it } from 'vitest';

import { keepLastValidDiagram, parseDbmlDiagram, type ParsedDiagram } from './dbml-diagram-parser';

const VALID_DBML = `
Table users {
  id integer [pk]
  email varchar
}
`;

const INVALID_DBML = `
Table users {
  id integer [pk]
`;

describe('parseDbmlDiagram', () => {
	it('parses valid DBML into diagram tables', () => {
		const parsed = parseDbmlDiagram(VALID_DBML, {});

		expect(parsed.error).toBeNull();
		expect(parsed.tables).toHaveLength(1);
		expect(parsed.tables[0]).toMatchObject({
			name: 'users',
			x: 20,
			y: 20
		});
	});

	it('returns a parse error for invalid DBML', () => {
		const parsed = parseDbmlDiagram(INVALID_DBML, {});

		expect(parsed.tables).toHaveLength(0);
		expect(parsed.error).toBeTruthy();
	});
});

describe('keepLastValidDiagram', () => {
	it('keeps the last valid diagram visible during transient parse errors', () => {
		const lastValid = parseDbmlDiagram(VALID_DBML, {});
		const invalid = parseDbmlDiagram(INVALID_DBML, {});

		const resolved = keepLastValidDiagram(invalid, lastValid);

		expect(resolved.tables).toHaveLength(1);
		expect(resolved.tables[0].name).toBe('users');
		expect(resolved.error).toBeTruthy();
	});

	it('does not mask parse errors when there is no previous valid diagram', () => {
		const invalid = parseDbmlDiagram(INVALID_DBML, {});

		const resolved = keepLastValidDiagram(invalid, null);

		expect(resolved).toEqual(invalid);
	});

	it('does not reuse an empty previous parse result', () => {
		const invalid = parseDbmlDiagram(INVALID_DBML, {});
		const previous: ParsedDiagram = {
			tables: [],
			refs: [],
			error: null
		};

		const resolved = keepLastValidDiagram(invalid, previous);

		expect(resolved).toEqual(invalid);
	});
});
