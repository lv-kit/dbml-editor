import { Parser } from '@dbml/core';

import { layoutTables } from './dbml-diagram-layout';

export interface DiagramTable {
	name: string;
	note: string;
	headerColor: string;
	fields: { name: string; type: string; pk: boolean; note: string }[];
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DiagramRef {
	fromTable: string;
	fromField: string;
	toTable: string;
	toField: string;
	fromRelation: string;
	toRelation: string;
}

export interface ParsedDiagram {
	tables: DiagramTable[];
	refs: DiagramRef[];
	error: string | null;
}

export type TablePositions = Record<string, { x: number; y: number }>;

const COLORS = [
	'#3498db',
	'#2ecc71',
	'#e74c3c',
	'#f39c12',
	'#9b59b6',
	'#1abc9c',
	'#e67e22',
	'#2980b9',
	'#27ae60',
	'#c0392b',
	'#d35400',
	'#8e44ad'
];

export function parseDbmlDiagram(dbml: string, tablePositions: TablePositions): ParsedDiagram {
	try {
		const parser = new Parser();
		const database = parser.parse(dbml, 'dbmlv2');
		const tables: DiagramTable[] = [];
		const refs: DiagramRef[] = [];

		let tableIndex = 0;
		const pendingTables: Array<{
			name: string;
			note: string;
			headerColor: string;
			fields: { name: string; type: string; pk: boolean; note: string }[];
		}> = [];

		for (const schema of database.schemas) {
			for (const table of schema.tables) {
				const fields = table.fields.map((field) => ({
					name: field.name,
					type: field.type?.type_name || String(field.type || ''),
					pk: field.pk,
					note: field.note || ''
				}));

				pendingTables.push({
					name: table.name,
					note: table.note || '',
					headerColor: COLORS[tableIndex % COLORS.length],
					fields
				});

				tableIndex++;
			}

			for (const ref of schema.refs) {
				if (ref.endpoints.length < 2) continue;
				refs.push({
					fromTable: ref.endpoints[0].tableName,
					fromField: ref.endpoints[0].fieldNames[0],
					toTable: ref.endpoints[1].tableName,
					toField: ref.endpoints[1].fieldNames[0],
					fromRelation: ref.endpoints[0].relation,
					toRelation: ref.endpoints[1].relation
				});
			}
		}

		const positions = layoutTables(
			pendingTables.map((table) => ({
				name: table.name,
				note: table.note,
				fieldCount: table.fields.length,
				position: tablePositions[table.name]
			}))
		);

		tables.push(
			...pendingTables.map((table, index) => ({
				...table,
				...positions[index]
			}))
		);

		return { tables, refs, error: null };
	} catch (error) {
		return {
			tables: [],
			refs: [],
			error: getParseErrorMessage(error)
		};
	}
}

export function keepLastValidDiagram(
	next: ParsedDiagram,
	lastValid: ParsedDiagram | null
): ParsedDiagram {
	if (!next.error || !lastValid) {
		return next;
	}

	if (lastValid.tables.length === 0 && lastValid.refs.length === 0) {
		return next;
	}

	return {
		...lastValid,
		error: next.error
	};
}

function getParseErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message;
	}

	return 'Parse error';
}
