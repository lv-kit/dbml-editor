import { describe, expect, it } from 'vitest';

import {
	GRID_GAP_Y,
	HEADER_HEIGHT,
	NOTE_HEADER_HEIGHT,
	NOTE_LINE_HEIGHT,
	NOTE_SPACING_TOP,
	ROW_HEIGHT,
	TABLE_PADDING,
	layoutTables
} from './dbml-diagram-layout';

describe('layoutTables', () => {
	it('stacks later tables below taller tables in the same column', () => {
		const layouts = layoutTables([
			{ name: 'users', note: '', fieldCount: 8 },
			{ name: 'posts', note: '', fieldCount: 1 },
			{ name: 'comments', note: '', fieldCount: 1 },
			{ name: 'tags', note: '', fieldCount: 1 },
			{ name: 'profiles', note: '', fieldCount: 1 }
		]);

		const firstTableHeight = HEADER_HEIGHT + 8 * ROW_HEIGHT + TABLE_PADDING;

		expect(layouts[0]).toMatchObject({ x: 20, y: 20 });
		expect(layouts[4]).toMatchObject({
			x: 20,
			y: 20 + firstTableHeight + GRID_GAP_Y
		});
	});

	it('accounts for table notes when placing the next table in the same column', () => {
		const layouts = layoutTables([
			{
				name: 'users',
				note: 'This note is definitely longer than thirty characters.',
				fieldCount: 1
			},
			{ name: 'posts', note: '', fieldCount: 1 },
			{ name: 'comments', note: '', fieldCount: 1 },
			{ name: 'tags', note: '', fieldCount: 1 },
			{ name: 'profiles', note: '', fieldCount: 1 }
		]);

		const firstTableHeight = HEADER_HEIGHT + ROW_HEIGHT + TABLE_PADDING;
		const noteHeight = NOTE_SPACING_TOP + NOTE_HEADER_HEIGHT + 2 * NOTE_LINE_HEIGHT;

		expect(layouts[4].y).toBe(20 + firstTableHeight + noteHeight + GRID_GAP_Y);
	});

	it('keeps custom positions while still moving following tables below the occupied space', () => {
		const layouts = layoutTables([
			{ name: 'users', note: '', fieldCount: 3, position: { x: 20, y: 120 } },
			{ name: 'posts', note: '', fieldCount: 1 },
			{ name: 'comments', note: '', fieldCount: 1 },
			{ name: 'tags', note: '', fieldCount: 1 },
			{ name: 'profiles', note: '', fieldCount: 1 }
		]);

		const firstTableHeight = HEADER_HEIGHT + 3 * ROW_HEIGHT + TABLE_PADDING;

		expect(layouts[0]).toMatchObject({ x: 20, y: 120 });
		expect(layouts[4].y).toBe(120 + firstTableHeight + GRID_GAP_Y);
	});
});
