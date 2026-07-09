export const TABLE_WIDTH = 220;
export const HEADER_HEIGHT = 32;
export const ROW_HEIGHT = 26;
export const TABLE_PADDING = 8;
export const GRID_GAP_X = 60;
export const GRID_GAP_Y = 40;
export const COLUMNS = 4;
const GRID_START_X = 20;
const GRID_START_Y = 20;
export const NOTE_WRAP_THRESHOLD = 30;
export const NOTE_SPACING_TOP = 8;
export const NOTE_HEADER_HEIGHT = 28;
export const NOTE_LINE_HEIGHT = 16;

export interface DiagramLayoutTable {
	name: string;
	note: string;
	fieldCount: number;
	position?: { x: number; y: number };
}

export interface DiagramTableLayout {
	x: number;
	y: number;
	width: number;
	height: number;
}

function getTableHeight(fieldCount: number): number {
	return HEADER_HEIGHT + fieldCount * ROW_HEIGHT + TABLE_PADDING;
}

function getTableNoteHeight(note: string): number {
	if (note.length === 0) return 0;
	const lineCount = note.length > NOTE_WRAP_THRESHOLD ? 2 : 1;
	return NOTE_SPACING_TOP + NOTE_HEADER_HEIGHT + lineCount * NOTE_LINE_HEIGHT;
}

function getColumnIndexForX(x: number): number {
	const approximateColumn = Math.round((x - GRID_START_X) / (TABLE_WIDTH + GRID_GAP_X));
	return Math.max(0, Math.min(COLUMNS - 1, approximateColumn));
}

export function layoutTables(tables: DiagramLayoutTable[]): DiagramTableLayout[] {
	const columnBottoms = Array.from({ length: COLUMNS }, () => GRID_START_Y);

	return tables.map((table, tableIndex) => {
		const defaultColumn = tableIndex % COLUMNS;
		const defaultX = defaultColumn * (TABLE_WIDTH + GRID_GAP_X) + GRID_START_X;
		const defaultY = columnBottoms[defaultColumn];
		const x = table.position?.x ?? defaultX;
		const y = table.position?.y ?? defaultY;
		const height = getTableHeight(table.fieldCount);
		const occupiedHeight = height + getTableNoteHeight(table.note);
		const occupiedColumn = table.position ? getColumnIndexForX(x) : defaultColumn;

		columnBottoms[occupiedColumn] = Math.max(
			columnBottoms[occupiedColumn],
			y + occupiedHeight + GRID_GAP_Y
		);

		return {
			x,
			y,
			width: TABLE_WIDTH,
			height
		};
	});
}
