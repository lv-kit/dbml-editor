<script lang="ts">
	import { Parser } from '@dbml/core';

	interface Props {
		dbml: string;
		onchange?: (dbml: string) => void;
	}

	let { dbml, onchange }: Props = $props();

	interface DiagramTable {
		name: string;
		note: string;
		headerColor: string;
		fields: { name: string; type: string; pk: boolean; note: string }[];
		x: number;
		y: number;
		width: number;
		height: number;
	}

	interface DiagramRef {
		fromTable: string;
		fromField: string;
		toTable: string;
		toField: string;
		fromRelation: string;
		toRelation: string;
	}

	interface NoteTooltip {
		table: string;
		field: string;
		fieldType: string;
		note: string;
		x: number;
		y: number;
	}

	const TABLE_WIDTH = 220;
	const HEADER_HEIGHT = 32;
	const ROW_HEIGHT = 26;
	const TABLE_PADDING = 8;
	const GRID_GAP_X = 60;
	const GRID_GAP_Y = 40;
	const COLUMNS = 4;
	const TOOLTIP_WIDTH = 240;
	const TOOLTIP_COLORS = {
		shadow: 'rgba(15,23,42,0.18)',
		body: '#0f172a',
		border: '#334155',
		divider: '#475569',
		type: '#fbbf24',
		note: '#e2e8f0'
	};

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

	// Custom table positions (overrides grid layout when dragged)
	let tablePositions: Record<string, { x: number; y: number }> = $state({});

	let parsed = $derived.by(() => {
		try {
			const parser = new Parser();
			const database = parser.parse(dbml, 'dbmlv2');
			const tables: DiagramTable[] = [];
			const refs: DiagramRef[] = [];

			let tableIndex = 0;
			for (const schema of database.schemas) {
				for (const table of schema.tables) {
					const fields = table.fields.map((f: any) => ({
						name: f.name,
						type: f.type?.type_name || String(f.type || ''),
						pk: f.pk,
						note: f.note || ''
					}));

					const tableNote = table.note || '';
					const height = HEADER_HEIGHT + fields.length * ROW_HEIGHT + TABLE_PADDING;
					const col = tableIndex % COLUMNS;
					const row = Math.floor(tableIndex / COLUMNS);
					const defaultX = col * (TABLE_WIDTH + GRID_GAP_X) + 20;
					const defaultY = row * (300 + GRID_GAP_Y) + 20;

					const pos = tablePositions[table.name];
					const x = pos ? pos.x : defaultX;
					const y = pos ? pos.y : defaultY;

					tables.push({
						name: table.name,
						note: tableNote,
						headerColor: COLORS[tableIndex % COLORS.length],
						fields,
						x,
						y,
						width: TABLE_WIDTH,
						height
					});

					tableIndex++;
				}

				for (const ref of schema.refs) {
					if (ref.endpoints.length >= 2) {
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
			}

			return { tables, refs, error: null };
		} catch (e: any) {
			return { tables: [], refs: [], error: e.message || 'Parse error' };
		}
	});

	function getTableByName(name: string): DiagramTable | undefined {
		return parsed.tables.find((t) => t.name === name);
	}

	function getFieldY(table: DiagramTable, fieldName: string): number {
		const fieldIndex = table.fields.findIndex((f) => f.name === fieldName);
		if (fieldIndex === -1) return table.y + HEADER_HEIGHT;
		return table.y + HEADER_HEIGHT + fieldIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
	}

	function truncateText(text: string, maxChars: number): string {
		const chars = Array.from(text);
		if (chars.length <= maxChars) return text;
		if (maxChars <= 1) return '\u2026';
		return `${chars.slice(0, maxChars - 1).join('')}\u2026`;
	}

	// Split note text into up to two lines and truncate the final line with an ellipsis.
	function splitTooltipNote(note: string, maxCharsPerLine = 26, maxLines = 2): string[] {
		const chars = Array.from(note.trim());
		if (chars.length === 0) return [''];

		const lines: string[] = [];
		for (let i = 0; i < chars.length && lines.length < maxLines; i += maxCharsPerLine) {
			const lineChars = chars.slice(i, i + maxCharsPerLine);
			if (lines.length === maxLines - 1 && i + maxCharsPerLine < chars.length) {
				lines.push(`${lineChars.slice(0, Math.max(lineChars.length - 1, 1)).join('')}\u2026`);
				return lines;
			}
			lines.push(lineChars.join(''));
		}

		return lines;
	}

	function computeRefPath(ref: DiagramRef): string | null {
		const fromTable = getTableByName(ref.fromTable);
		const toTable = getTableByName(ref.toTable);
		if (!fromTable || !toTable) return null;

		const fromY = getFieldY(fromTable, ref.fromField);
		const toY = getFieldY(toTable, ref.toField);

		const fromRight = fromTable.x + fromTable.width;
		const toLeft = toTable.x;
		const fromLeft = fromTable.x;
		const toRight = toTable.x + toTable.width;

		let x1: number, x2: number;
		if (fromRight <= toLeft) {
			x1 = fromRight;
			x2 = toLeft;
		} else if (toRight <= fromLeft) {
			x1 = fromLeft;
			x2 = toRight;
		} else {
			x1 = fromRight;
			x2 = toRight;
		}

		const cpOffset = Math.max(Math.abs(x2 - x1) * 0.4, 30);

		return `M ${x1} ${fromY} C ${x1 + cpOffset} ${fromY}, ${x2 - cpOffset * Math.sign(x2 - x1)} ${toY}, ${x2} ${toY}`;
	}

	let svgWidth = $derived(Math.max(800, ...parsed.tables.map((t) => t.x + t.width + 40)));
	let svgHeight = $derived(Math.max(600, ...parsed.tables.map((t) => t.y + t.height + 40)));

	// Pan & zoom state
	let containerEl: HTMLDivElement | undefined = $state();
	let viewBox = $state({ x: 0, y: 0, w: 0, h: 0 });
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0, vx: 0, vy: 0 });

	// Drag table state
	let draggingTable = $state<string | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });

	// Connection drawing state
	let connecting = $state<{ table: string; field: string } | null>(null);
	let connectMousePos = $state({ x: 0, y: 0 });

	// Track if mouse actually moved during mousedown→mouseup (drag detection)
	let hasDragged = $state(false);
	let mouseDownPos = $state<{ x: number; y: number } | null>(null);
	const DRAG_THRESHOLD = 5;

	// Unified selection state
	type Selection =
		| { type: 'ref'; ref: DiagramRef }
		| { type: 'table'; tableName: string }
		| { type: 'field'; tableName: string; fieldName: string }
		| null;

	let selection = $state<Selection>(null);

	// Highlight field under cursor during connection
	let hoveredField = $state<{ table: string; field: string } | null>(null);

	// Tooltip for field notes on hover
	let noteTooltip = $state<NoteTooltip | null>(null);

	$effect(() => {
		if (containerEl) {
			viewBox = { x: 0, y: 0, w: containerEl.clientWidth, h: containerEl.clientHeight };
		}
	});

	// Use window-level mouseup to reliably catch mouseup even if mouse leaves SVG elements
	$effect(() => {
		const onMouseUp = (e: MouseEvent) => handleMouseUp(e);
		window.addEventListener('mouseup', onMouseUp);
		return () => window.removeEventListener('mouseup', onMouseUp);
	});

	// Use window-level keydown (capture phase) so we intercept Delete/Backspace
	// before CodeMirror processes it when a diagram selection is active
	$effect(() => {
		const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e);
		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	});

	// Clear selection when clicking outside the diagram container
	$effect(() => {
		const onMouseDown = (e: MouseEvent) => {
			if (selection && containerEl && !containerEl.contains(e.target as Node)) {
				selection = null;
			}
		};
		window.addEventListener('mousedown', onMouseDown, true);
		return () => window.removeEventListener('mousedown', onMouseDown, true);
	});

	function clientToSvg(clientX: number, clientY: number): { x: number; y: number } {
		if (!containerEl) return { x: 0, y: 0 };
		const rect = containerEl.getBoundingClientRect();
		return {
			x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.w,
			y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.h
		};
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
			const rect = containerEl!.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const svgX = viewBox.x + (mouseX / rect.width) * viewBox.w;
			const svgY = viewBox.y + (mouseY / rect.height) * viewBox.h;

			const newW = viewBox.w * scaleFactor;
			const newH = viewBox.h * scaleFactor;
			viewBox = {
				x: svgX - (mouseX / rect.width) * newW,
				y: svgY - (mouseY / rect.height) * newH,
				w: newW,
				h: newH
			};
		} else {
			const panSpeed = viewBox.w / (containerEl?.clientWidth || 800);
			viewBox = {
				...viewBox,
				x: viewBox.x + e.deltaX * panSpeed,
				y: viewBox.y + e.deltaY * panSpeed
			};
		}
	}

	function handleMouseDown(e: MouseEvent) {
		// Left click on empty area (not on table header/field/ref — those call stopPropagation)
		// → clear selection
		if (e.button === 0 && !e.shiftKey && !draggingTable && !connecting) {
			selection = null;
		}

		if (draggingTable || connecting) return;
		if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
			isPanning = true;
			panStart = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
			e.preventDefault();
		}
	}

	function checkDragThreshold(e: MouseEvent) {
		if (!hasDragged && mouseDownPos) {
			const dx = e.clientX - mouseDownPos.x;
			const dy = e.clientY - mouseDownPos.y;
			if (Math.sqrt(dx * dx + dy * dy) >= DRAG_THRESHOLD) {
				hasDragged = true;
			}
		}
	}

	function handleMouseMove(e: MouseEvent) {
		checkDragThreshold(e);

		if (draggingTable && hasDragged) {
			const svgPos = clientToSvg(e.clientX, e.clientY);
			tablePositions = {
				...tablePositions,
				[draggingTable]: {
					x: svgPos.x - dragOffset.x,
					y: svgPos.y - dragOffset.y
				}
			};
			return;
		}

		if (connecting && hasDragged) {
			connectMousePos = clientToSvg(e.clientX, e.clientY);
			return;
		}

		if (!isPanning || !containerEl) return;
		const scale = viewBox.w / containerEl.clientWidth;
		viewBox = {
			...viewBox,
			x: panStart.vx - (e.clientX - panStart.x) * scale,
			y: panStart.vy - (e.clientY - panStart.y) * scale
		};
	}

	function handleMouseUp(e: MouseEvent) {
		if (draggingTable) {
			const tableName = draggingTable;
			draggingTable = null;
			if (!hasDragged) {
				// Click on table header → select table
				selection = { type: 'table', tableName };
				containerEl?.focus();
			}
			mouseDownPos = null;
			hasDragged = false;
			return;
		}

		if (connecting) {
			const source = connecting;
			connecting = null;
			if (!hasDragged) {
				// Click on field → select field
				selection = { type: 'field', tableName: source.table, fieldName: source.field };
				containerEl?.focus();
			} else {
				// Dragged → try to create ref
				const svgPos = clientToSvg(e.clientX, e.clientY);
				const target = findFieldAtPosition(svgPos.x, svgPos.y);
				if (target && (target.table !== source.table || target.field !== source.field)) {
					addRef(source.table, source.field, target.table, target.field);
				}
			}
			mouseDownPos = null;
			hasDragged = false;
			return;
		}

		isPanning = false;
		mouseDownPos = null;
		hasDragged = false;
	}

	function handleTableHeaderMouseDown(e: MouseEvent, tableName: string) {
		if (e.button !== 0 || e.shiftKey) return;
		e.stopPropagation();
		mouseDownPos = { x: e.clientX, y: e.clientY };
		hasDragged = false;
		const table = getTableByName(tableName);
		if (!table) return;

		const svgPos = clientToSvg(e.clientX, e.clientY);
		dragOffset = { x: svgPos.x - table.x, y: svgPos.y - table.y };
		draggingTable = tableName;
	}

	function handleFieldMouseDown(e: MouseEvent, tableName: string, fieldName: string) {
		if (e.button !== 0 || e.shiftKey) return;
		e.stopPropagation();
		mouseDownPos = { x: e.clientX, y: e.clientY };
		hasDragged = false;
		connecting = { table: tableName, field: fieldName };
		connectMousePos = clientToSvg(e.clientX, e.clientY);
	}

	function findFieldAtPosition(
		svgX: number,
		svgY: number
	): { table: string; field: string } | null {
		for (const table of parsed.tables) {
			if (svgX < table.x || svgX > table.x + table.width) continue;
			const relY = svgY - table.y - HEADER_HEIGHT;
			if (relY < 0 || relY > table.fields.length * ROW_HEIGHT) continue;
			const fieldIndex = Math.floor(relY / ROW_HEIGHT);
			if (fieldIndex >= 0 && fieldIndex < table.fields.length) {
				return { table: table.name, field: table.fields[fieldIndex].name };
			}
		}
		return null;
	}

	function addRef(fromTable: string, fromField: string, toTable: string, toField: string) {
		if (!onchange) return;
		const refLine = `\nRef: ${fromTable}.${fromField} > ${toTable}.${toField}\n`;
		onchange(dbml + refLine);
	}

	function getConnectingLinePath(): string | null {
		if (!connecting || !hasDragged) return null;
		const table = getTableByName(connecting.table);
		if (!table) return null;

		const fromY = getFieldY(table, connecting.field);
		const fromX = table.x + table.width;
		const toX = connectMousePos.x;
		const toY = connectMousePos.y;
		const cpOffset = Math.max(Math.abs(toX - fromX) * 0.4, 30);

		return `M ${fromX} ${fromY} C ${fromX + cpOffset} ${fromY}, ${toX - cpOffset} ${toY}, ${toX} ${toY}`;
	}

	// --- Selection & deletion ---

	function handleRefMouseDown(e: MouseEvent, ref: DiagramRef) {
		if (e.button !== 0) return;
		e.stopPropagation();
		selection = { type: 'ref', ref };
		containerEl?.focus();
	}

	function cleanupDbml(text: string): string {
		const lines = text.split('\n');
		const cleaned: string[] = [];
		for (const line of lines) {
			if (line.trim() === '' && cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
				continue;
			}
			cleaned.push(line);
		}
		while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
			cleaned.pop();
		}
		return cleaned.join('\n') + '\n';
	}

	function removeRef(ref: DiagramRef) {
		if (!onchange) return;
		const fromTo = `${ref.fromTable}.${ref.fromField}`;
		const toTo = `${ref.toTable}.${ref.toField}`;

		const lines = dbml.split('\n');

		// 1. Try standalone Ref: line removal
		let foundStandalone = false;
		const filteredLines = lines.filter((line) => {
			const trimmed = line.trim();
			if (trimmed.startsWith('Ref') && trimmed.includes(fromTo) && trimmed.includes(toTo)) {
				foundStandalone = true;
				return false;
			}
			return true;
		});

		if (foundStandalone) {
			onchange(cleanupDbml(filteredLines.join('\n')));
			selection = null;
			return;
		}

		// 2. Try inline ref removal (e.g. field_name type [ref: > table.field, ...])
		const candidates = [
			{ table: ref.fromTable, field: ref.fromField, target: toTo },
			{ table: ref.toTable, field: ref.toField, target: fromTo }
		];

		let insideTable = false;
		let currentTable = '';
		let braceDepth = 0;

		for (let i = 0; i < lines.length; i++) {
			const trimmed = lines[i].trim();

			if (!insideTable) {
				const tableMatch = trimmed.match(/^Table\s+(\S+)\s*\{/);
				if (tableMatch) {
					insideTable = true;
					currentTable = tableMatch[1];
					braceDepth = 1;
				}
				continue;
			}

			for (const ch of trimmed) {
				if (ch === '{') braceDepth++;
				else if (ch === '}') braceDepth--;
			}

			if (braceDepth <= 0) {
				insideTable = false;
				continue;
			}

			for (const cand of candidates) {
				if (currentTable !== cand.table) continue;

				const fieldMatch = trimmed.match(/^(\S+)\s+/);
				if (!fieldMatch || fieldMatch[1] !== cand.field) continue;

				const targetEsc = cand.target.replace(/\./g, '\\.');
				const refPattern = new RegExp(`ref:\\s*[><\\-]\\s*${targetEsc}`);
				if (!refPattern.test(lines[i])) continue;

				let newLine = lines[i];

				// Try: ", ref: X target" (ref preceded by comma)
				const p1 = new RegExp(`,\\s*ref:\\s*[><\\-]\\s*${targetEsc}`);
				if (p1.test(newLine)) {
					newLine = newLine.replace(p1, '');
				} else {
					// Try: "ref: X target, " (ref followed by comma)
					const p2 = new RegExp(`ref:\\s*[><\\-]\\s*${targetEsc}\\s*,\\s*`);
					if (p2.test(newLine)) {
						newLine = newLine.replace(p2, '');
					} else {
						// ref is the only annotation
						newLine = newLine.replace(refPattern, '');
					}
				}

				// Clean up empty brackets
				newLine = newLine.replace(/\[\s*\]/, '');

				lines[i] = newLine;
				onchange(cleanupDbml(lines.join('\n')));
				selection = null;
				return;
			}
		}
	}

	function removeTable(tableName: string) {
		if (!onchange) return;
		const lines = dbml.split('\n');
		const newLines: string[] = [];
		let insideTarget = false;
		let braceDepth = 0;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!insideTarget) {
				const tableMatch = trimmed.match(/^Table\s+(\S+)\s*\{/);
				if (tableMatch && tableMatch[1] === tableName) {
					insideTarget = true;
					braceDepth = 1;
					continue;
				}
				newLines.push(line);
			} else {
				for (const ch of trimmed) {
					if (ch === '{') braceDepth++;
					else if (ch === '}') braceDepth--;
				}
				if (braceDepth <= 0) {
					insideTarget = false;
				}
			}
		}

		// Also remove Ref lines that reference this table
		const filtered = newLines.filter((line) => {
			const trimmed = line.trim();
			if (!trimmed.startsWith('Ref')) return true;
			if (trimmed.includes(`${tableName}.`)) return false;
			return true;
		});

		const { [tableName]: _, ...rest } = tablePositions;
		tablePositions = rest;

		onchange(cleanupDbml(filtered.join('\n')));
		selection = null;
	}

	function removeField(tableName: string, fieldName: string) {
		if (!onchange) return;
		const lines = dbml.split('\n');
		const newLines: string[] = [];
		let insideTarget = false;
		let braceDepth = 0;

		for (const line of lines) {
			const trimmed = line.trim();
			if (!insideTarget) {
				const tableMatch = trimmed.match(/^Table\s+(\S+)\s*\{/);
				if (tableMatch && tableMatch[1] === tableName) {
					insideTarget = true;
					braceDepth = 1;
					newLines.push(line);
					continue;
				}
				newLines.push(line);
			} else {
				for (const ch of trimmed) {
					if (ch === '{') braceDepth++;
					else if (ch === '}') braceDepth--;
				}
				if (braceDepth <= 0) {
					insideTarget = false;
					newLines.push(line);
					continue;
				}
				const fieldMatch = trimmed.match(/^(\S+)\s+/);
				if (fieldMatch && fieldMatch[1] === fieldName) {
					continue; // skip this field line
				}
				newLines.push(line);
			}
		}

		// Also remove Ref lines that reference this specific field
		const filtered = newLines.filter((line) => {
			const trimmed = line.trim();
			if (!trimmed.startsWith('Ref')) return true;
			if (trimmed.includes(`${tableName}.${fieldName}`)) return false;
			return true;
		});

		onchange(cleanupDbml(filtered.join('\n')));
		selection = null;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (selection && (e.key === 'Delete' || e.key === 'Backspace')) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (selection.type === 'ref') {
				removeRef(selection.ref);
			} else if (selection.type === 'table') {
				removeTable(selection.tableName);
			} else if (selection.type === 'field') {
				removeField(selection.tableName, selection.fieldName);
			}
		}
		if (e.key === 'Escape') {
			selection = null;
		}
	}

	function handleFieldMouseEnter(tableName: string, fieldName: string) {
		if (connecting && (tableName !== connecting.table || fieldName !== connecting.field)) {
			hoveredField = { table: tableName, field: fieldName };
		}
		// Show note tooltip
		const table = getTableByName(tableName);
		if (!table) return;
		const field = table.fields.find((f) => f.name === fieldName);
		if (field && field.note) {
			const fy = getFieldY(table, fieldName);
			noteTooltip = {
				table: tableName,
				field: fieldName,
				fieldType: field.type,
				note: field.note,
				x: table.x + table.width + 8,
				y: fy
			};
		}
	}

	function handleFieldMouseLeave() {
		hoveredField = null;
		noteTooltip = null;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={containerEl}
	class="h-full w-full overflow-hidden bg-white outline-none"
	role="application"
	tabindex="0"
	onwheel={handleWheel}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseleave={() => {
		isPanning = false;
		draggingTable = null;
		connecting = null;
		hasDragged = false;
		mouseDownPos = null;
	}}
>
	{#if parsed.error}
		<div class="flex h-full items-center justify-center text-gray-400">
			<div class="text-center">
				<p class="mb-2 text-lg">Diagram</p>
				<p class="text-sm">{parsed.error}</p>
			</div>
		</div>
	{:else if parsed.tables.length === 0}
		<div class="flex h-full items-center justify-center text-gray-400">
			<p>DBMLを入力するとダイアグラムが表示されます</p>
		</div>
	{:else}
		<svg
			width="100%"
			height="100%"
			viewBox="{viewBox.x} {viewBox.y} {viewBox.w} {viewBox.h}"
			style="cursor: {draggingTable && hasDragged
				? 'grabbing'
				: connecting && hasDragged
					? 'crosshair'
					: 'default'}"
		>
			<!-- Relationship lines -->
			{#each parsed.refs as ref}
				{@const path = computeRefPath(ref)}
				{@const isSelected =
					selection?.type === 'ref' &&
					selection.ref.fromTable === ref.fromTable &&
					selection.ref.fromField === ref.fromField &&
					selection.ref.toTable === ref.toTable &&
					selection.ref.toField === ref.toField}
				{#if path}
					<!-- Invisible wider hit area for clicking -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<path
						d={path}
						fill="none"
						stroke="transparent"
						stroke-width="12"
						style="cursor: pointer"
						onmousedown={(e) => handleRefMouseDown(e, ref)}
					/>
					<!-- Visible line -->
					<path
						d={path}
						fill="none"
						stroke={isSelected ? '#3b82f6' : '#94a3b8'}
						stroke-width={isSelected ? 2.5 : 1.5}
						style="pointer-events: none"
					/>
				{/if}
			{/each}

			<!-- Connection drawing preview -->
			{#if connecting && hasDragged}
				{@const connectPath = getConnectingLinePath()}
				{#if connectPath}
					<path
						d={connectPath}
						fill="none"
						stroke="#3b82f6"
						stroke-width="2"
						stroke-dasharray="6 3"
					/>
				{/if}
			{/if}

			<!-- Tables -->
			{#each parsed.tables as table}
				{@const isTableSelected = selection?.type === 'table' && selection.tableName === table.name}
				<g>
					<!-- Shadow -->
					<rect
						x={table.x + 2}
						y={table.y + 2}
						width={table.width}
						height={table.height}
						rx="4"
						fill="rgba(0,0,0,0.08)"
					/>

					<!-- Table body -->
					<rect
						x={table.x}
						y={table.y}
						width={table.width}
						height={table.height}
						rx="4"
						fill="white"
						stroke={isTableSelected
							? '#3b82f6'
							: draggingTable === table.name && hasDragged
								? '#3b82f6'
								: '#e2e8f0'}
						stroke-width={isTableSelected || (draggingTable === table.name && hasDragged) ? 2 : 1}
					/>

					<!-- Header (draggable / clickable for selection) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<rect
						x={table.x}
						y={table.y}
						width={table.width}
						height={HEADER_HEIGHT}
						rx="4"
						fill={table.headerColor}
						style="cursor: grab"
						onmousedown={(e) => handleTableHeaderMouseDown(e, table.name)}
					/>
					<rect
						x={table.x}
						y={table.y + HEADER_HEIGHT - 4}
						width={table.width}
						height="4"
						fill={table.headerColor}
						style="cursor: grab"
						onmousedown={(e) => handleTableHeaderMouseDown(e, table.name)}
					/>

					<!-- Table name -->
					<text
						x={table.x + 10}
						y={table.y + HEADER_HEIGHT / 2 + 1}
						fill="white"
						font-size="13"
						font-weight="bold"
						dominant-baseline="middle"
						style="pointer-events: none"
					>
						{table.name}
					</text>

					<!-- Fields -->
					{#each table.fields as field, i}
						{@const fy = table.y + HEADER_HEIGHT + i * ROW_HEIGHT}
						{@const isHovered =
							hoveredField?.table === table.name && hoveredField?.field === field.name}
						{@const isConnectSource =
							connecting?.table === table.name && connecting?.field === field.name}
						{@const isFieldSelected =
							selection?.type === 'field' &&
							selection.tableName === table.name &&
							selection.fieldName === field.name}

						<!-- Hit area for connection / selection -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<rect
							x={table.x}
							y={fy}
							width={table.width}
							height={ROW_HEIGHT}
							data-testid={`field-row-${table.name}-${field.name}`}
							fill={isFieldSelected
								? 'rgba(59, 130, 246, 0.18)'
								: isHovered
									? 'rgba(59, 130, 246, 0.1)'
									: isConnectSource
										? 'rgba(59, 130, 246, 0.05)'
										: 'transparent'}
							style="cursor: {connecting && hasDragged ? 'crosshair' : 'pointer'}"
							onmousedown={(e) => handleFieldMouseDown(e, table.name, field.name)}
							onmouseenter={() => handleFieldMouseEnter(table.name, field.name)}
							onmouseleave={handleFieldMouseLeave}
						/>

						<!-- Selected field border indicator -->
						{#if isFieldSelected}
							<rect
								x={table.x + 1}
								y={fy + 1}
								width={table.width - 2}
								height={ROW_HEIGHT - 2}
								rx="2"
								fill="none"
								stroke="#3b82f6"
								stroke-width="1.5"
								style="pointer-events: none"
							/>
						{/if}

						<!-- Row separator -->
						{#if i > 0 && !isFieldSelected}
							<line
								x1={table.x}
								y1={fy}
								x2={table.x + table.width}
								y2={fy}
								stroke="#f1f5f9"
								stroke-width="1"
								style="pointer-events: none"
							/>
						{/if}

						<!-- Connection dot indicator (left) -->
						<circle
							cx={table.x}
							cy={fy + ROW_HEIGHT / 2}
							r="4"
							fill={isFieldSelected
								? '#3b82f6'
								: isHovered
									? '#3b82f6'
									: isConnectSource
										? '#3b82f6'
										: '#cbd5e1'}
							stroke="white"
							stroke-width="1.5"
							style="pointer-events: none"
						/>

						<!-- Connection dot indicator (right) -->
						<circle
							cx={table.x + table.width}
							cy={fy + ROW_HEIGHT / 2}
							r="4"
							fill={isFieldSelected
								? '#3b82f6'
								: isHovered
									? '#3b82f6'
									: isConnectSource
										? '#3b82f6'
										: '#cbd5e1'}
							stroke="white"
							stroke-width="1.5"
							style="pointer-events: none"
						/>

						<!-- PK indicator -->
						{#if field.pk}
							<text
								x={table.x + 8}
								y={fy + ROW_HEIGHT / 2 + 1}
								fill="#f59e0b"
								font-size="10"
								font-weight="bold"
								dominant-baseline="middle"
								style="pointer-events: none"
							>
								PK
							</text>
							<text
								x={table.x + 30}
								y={fy + ROW_HEIGHT / 2 + 1}
								fill="#334155"
								font-size="12"
								font-weight="600"
								dominant-baseline="middle"
								style="pointer-events: none"
							>
								{field.name}
							</text>
						{:else}
							<text
								x={table.x + 10}
								y={fy + ROW_HEIGHT / 2 + 1}
								fill="#475569"
								font-size="12"
								dominant-baseline="middle"
								style="pointer-events: none"
							>
								{field.name}
							</text>
						{/if}

						<!-- Type -->
						<text
							x={table.x + table.width - 10}
							y={fy + ROW_HEIGHT / 2 + 1}
							fill="#94a3b8"
							font-size="11"
							text-anchor="end"
							dominant-baseline="middle"
							style="pointer-events: none"
						>
							{field.type}
						</text>

						<!-- Note indicator dot for fields with notes -->
						{#if field.note}
							<circle
								cx={table.x + table.width - 6}
								cy={fy + 6}
								r="3"
								fill="#fbbf24"
								style="pointer-events: none"
							/>
						{/if}
					{/each}
				</g>

				<!-- Table note as sticky note -->
				{#if table.note}
					{@const noteX = table.x}
					{@const noteY = table.y + table.height + 8}
					{@const noteWidth = table.width}
					{@const noteLines =
						table.note.length > 30
							? [
									table.note.slice(0, 30),
									table.note.slice(30, 60) + (table.note.length > 60 ? '\u2026' : '')
								]
							: [table.note]}
					{@const noteHeight = 28 + noteLines.length * 16}
					<g style="pointer-events: none">
						<!-- Sticky note shadow -->
						<rect
							x={noteX + 2}
							y={noteY + 2}
							width={noteWidth}
							height={noteHeight}
							rx="3"
							fill="rgba(0,0,0,0.06)"
						/>
						<!-- Sticky note body -->
						<rect
							x={noteX}
							y={noteY}
							width={noteWidth}
							height={noteHeight}
							rx="3"
							fill="#fef9c3"
							stroke="#fbbf24"
							stroke-width="1"
						/>
						<!-- Sticky note top accent -->
						<rect x={noteX} y={noteY} width={noteWidth} height="4" rx="3" fill="#fbbf24" />
						<!-- Note label -->
						<text
							x={noteX + 8}
							y={noteY + 18}
							fill="#b45309"
							font-size="11"
							dominant-baseline="middle"
							font-weight="bold"
						>
							Note
						</text>
						<!-- Note text lines -->
						{#each noteLines as line, li}
							<text
								x={noteX + 8}
								y={noteY + 18 + (li + 1) * 16}
								fill="#78350f"
								font-size="11"
								dominant-baseline="middle"
							>
								{line}
							</text>
						{/each}
					</g>
				{/if}
			{/each}

			<!-- Field note tooltip on hover -->
			{#if noteTooltip}
				{@const noteLines = splitTooltipNote(noteTooltip.note)}
				{@const ttWidth = TOOLTIP_WIDTH}
				{@const ttHeight = 30 + noteLines.length * 16}
				{@const ttTop = noteTooltip.y - ttHeight / 2}
				<g data-testid="note-tooltip" style="pointer-events: none">
					<!-- Tooltip shadow -->
					<rect
						x={noteTooltip.x + 1}
						y={ttTop + 1}
						width={ttWidth}
						height={ttHeight}
						rx="4"
						fill={TOOLTIP_COLORS.shadow}
					/>
					<!-- Tooltip body -->
					<rect
						x={noteTooltip.x}
						y={ttTop}
						width={ttWidth}
						height={ttHeight}
						rx="4"
						fill={TOOLTIP_COLORS.body}
						stroke={TOOLTIP_COLORS.border}
						stroke-width="1"
					/>
					<line
						x1={noteTooltip.x + 10}
						y1={ttTop + 24}
						x2={noteTooltip.x + ttWidth - 10}
						y2={ttTop + 24}
						stroke={TOOLTIP_COLORS.divider}
						stroke-width="1"
					/>
					<!-- Tooltip arrow -->
					<polygon
						points="{noteTooltip.x - 4},{noteTooltip.y} {noteTooltip.x},{noteTooltip.y -
							4} {noteTooltip.x},{noteTooltip.y + 4}"
						fill={TOOLTIP_COLORS.body}
					/>
					<text
						data-testid="note-tooltip-field"
						x={noteTooltip.x + 10}
						y={ttTop + 15}
						fill="white"
						font-size="12"
						font-weight="600"
						dominant-baseline="middle"
					>
						{truncateText(noteTooltip.field, 20)}
					</text>
					<text
						data-testid="note-tooltip-type"
						x={noteTooltip.x + ttWidth - 10}
						y={ttTop + 15}
						fill={TOOLTIP_COLORS.type}
						font-size="12"
						font-weight="600"
						text-anchor="end"
						dominant-baseline="middle"
					>
						{truncateText(noteTooltip.fieldType, 16)}
					</text>
					{#each noteLines as line, index}
						<text
							data-testid={`note-tooltip-note-${index}`}
							x={noteTooltip.x + 10}
							y={ttTop + 37 + index * 16}
							fill={TOOLTIP_COLORS.note}
							font-size="11"
							dominant-baseline="middle"
						>
							{line}
						</text>
					{/each}
				</g>
			{/if}
		</svg>
	{/if}
</div>
