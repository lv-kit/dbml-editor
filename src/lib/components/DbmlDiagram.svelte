<script lang="ts">
	import { Parser } from '@dbml/core';

	interface Props {
		dbml: string;
	}

	let { dbml }: Props = $props();

	interface DiagramTable {
		name: string;
		headerColor: string;
		fields: { name: string; type: string; pk: boolean }[];
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

	const TABLE_WIDTH = 220;
	const HEADER_HEIGHT = 32;
	const ROW_HEIGHT = 26;
	const TABLE_PADDING = 8;
	const GRID_GAP_X = 60;
	const GRID_GAP_Y = 40;
	const COLUMNS = 4;

	const COLORS = [
		'#3498db', '#2ecc71', '#e74c3c', '#f39c12',
		'#9b59b6', '#1abc9c', '#e67e22', '#2980b9',
		'#27ae60', '#c0392b', '#d35400', '#8e44ad'
	];

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
						pk: f.pk
					}));

					const height = HEADER_HEIGHT + fields.length * ROW_HEIGHT + TABLE_PADDING;
					const col = tableIndex % COLUMNS;
					const row = Math.floor(tableIndex / COLUMNS);
					const x = col * (TABLE_WIDTH + GRID_GAP_X) + 20;
					const y = row * (300 + GRID_GAP_Y) + 20;

					tables.push({
						name: table.name,
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

		const midX = (x1 + x2) / 2;
		const cpOffset = Math.max(Math.abs(x2 - x1) * 0.4, 30);

		return `M ${x1} ${fromY} C ${x1 + cpOffset} ${fromY}, ${x2 - cpOffset * Math.sign(x2 - x1)} ${toY}, ${x2} ${toY}`;
	}

	let svgWidth = $derived(
		Math.max(
			800,
			...parsed.tables.map((t) => t.x + t.width + 40)
		)
	);
	let svgHeight = $derived(
		Math.max(
			600,
			...parsed.tables.map((t) => t.y + t.height + 40)
		)
	);

	// Pan & zoom state
	let containerEl: HTMLDivElement | undefined = $state();
	let viewBox = $state({ x: 0, y: 0, w: 0, h: 0 });
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0, vx: 0, vy: 0 });

	$effect(() => {
		if (containerEl) {
			viewBox = { x: 0, y: 0, w: containerEl.clientWidth, h: containerEl.clientHeight };
		}
	});

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			// Zoom
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
			// Pan
			const panSpeed = viewBox.w / (containerEl?.clientWidth || 800);
			viewBox = {
				...viewBox,
				x: viewBox.x + e.deltaX * panSpeed,
				y: viewBox.y + e.deltaY * panSpeed
			};
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
			isPanning = true;
			panStart = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
			e.preventDefault();
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isPanning || !containerEl) return;
		const scale = viewBox.w / containerEl.clientWidth;
		viewBox = {
			...viewBox,
			x: panStart.vx - (e.clientX - panStart.x) * scale,
			y: panStart.vy - (e.clientY - panStart.y) * scale
		};
	}

	function handleMouseUp() {
		isPanning = false;
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={containerEl}
	class="h-full w-full overflow-hidden bg-white"
	role="application"
	onwheel={handleWheel}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
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
		>
			<!-- Relationship lines -->
			{#each parsed.refs as ref}
				{@const path = computeRefPath(ref)}
				{#if path}
					<path
						d={path}
						fill="none"
						stroke="#94a3b8"
						stroke-width="1.5"
					/>
				{/if}
			{/each}

			<!-- Tables -->
			{#each parsed.tables as table}
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
						stroke="#e2e8f0"
						stroke-width="1"
					/>

					<!-- Header -->
					<rect
						x={table.x}
						y={table.y}
						width={table.width}
						height={HEADER_HEIGHT}
						rx="4"
						fill={table.headerColor}
					/>
					<rect
						x={table.x}
						y={table.y + HEADER_HEIGHT - 4}
						width={table.width}
						height="4"
						fill={table.headerColor}
					/>

					<!-- Table name -->
					<text
						x={table.x + 10}
						y={table.y + HEADER_HEIGHT / 2 + 1}
						fill="white"
						font-size="13"
						font-weight="bold"
						dominant-baseline="middle"
					>
						{table.name}
					</text>

					<!-- Fields -->
					{#each table.fields as field, i}
						{@const fy = table.y + HEADER_HEIGHT + i * ROW_HEIGHT}
						<!-- Row separator -->
						{#if i > 0}
							<line
								x1={table.x}
								y1={fy}
								x2={table.x + table.width}
								y2={fy}
								stroke="#f1f5f9"
								stroke-width="1"
							/>
						{/if}

						<!-- PK indicator -->
						{#if field.pk}
							<text
								x={table.x + 8}
								y={fy + ROW_HEIGHT / 2 + 1}
								fill="#f59e0b"
								font-size="10"
								font-weight="bold"
								dominant-baseline="middle"
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
						>
							{field.type}
						</text>
					{/each}
				</g>
			{/each}
		</svg>
	{/if}
</div>
