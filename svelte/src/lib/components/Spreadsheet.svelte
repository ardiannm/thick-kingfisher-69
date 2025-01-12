<script lang="ts">
	import Editor from '$lib/components/Editor.svelte'

	interface Row {
		height: number
	}

	interface Column {
		width: number
	}

	interface Cell {
		value: number
	}

	interface RowState {
		[key: number]: Row
	}

	interface ColumnState {
		[key: number]: Column
	}

	interface CellState {
		[key: number]: {
			[key: number]: Cell
		}
	}

	let rowsSpecs = $state<RowState>({})
	let columnsSpecs = $state<ColumnState>({})
	let cellSpecs = $state<CellState>({
		1: {
			1: {
				value: 1
			},
			3: {
				value: 3
			},
			5: {
				value: 5
			}
		},
		2: {
			2: {
				value: 2
			},
			4: {
				value: 4
			},
			6: {
				value: 6
			}
		}
	})

	const rowNum = $state(20)
	const columnNum = $state(16)

	const rows = $derived(Array.from({ length: rowNum }, (_, i) => i + 1))
	const columns = $derived(Array.from({ length: columnNum }, (_, i) => i + 1))

	const defaultCellHeight = $state(21)
	const defaultCellWidth = $state(70)

	const getRowHeight = (row: number) => {
		const height = rowsSpecs[row]?.height || defaultCellHeight
		return height
	}

	const getColumnWidth = (column: number) => {
		const height = columnsSpecs[column]?.width || defaultCellWidth
		return height
	}

	const increaseColumnHeight = (column: number) => {
		if (!columnsSpecs[column]) {
			columnsSpecs[column] = { width: defaultCellWidth }
		}
		columnsSpecs[column].width += 5
	}

	const getCellValue = (row: number, column: number) => {
		if (row in cellSpecs && column in cellSpecs[row]) return cellSpecs[row][column].value
		return null
	}

	let activeRow = $state(4)
	let activeColumn = $state(4)

	const makeActive = (row: number, column: number) => {
		activeRow = row
		activeColumn = column
	}

	const isActive = (row: number, column: number) => {
		return activeRow === row && activeColumn === column
	}
</script>

<div class="spreadsheet">
	<div class="frame">
		{#each rows as _, row}
			<div class="row" style="height: {getRowHeight(row)}px">
				{#each columns as _, column}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cell" style="width: {getColumnWidth(column)}px; {isActive(row, column) ? 'justify-content: left; align-items: normal' : ''}" onmousedown={() => makeActive(row, column)}>
						{getCellValue(row, column)}
						{#if isActive(row, column)}
							<Editor text="D4+        " style="padding: 7px; border: 2px solid blue; position: absolute; z-index: 0; min-width: {getColumnWidth(column)}px; min-height: {defaultCellHeight}px; width: auto;" />
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.spreadsheet {
		display: flex;
		box-sizing: border-box;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	.frame {
		background-color: white;
		width: fit-content;
		height: fit-content;
		border-top: 1px solid #cccccc;
	}
	.row {
		display: flex;
		box-sizing: border-box;
	}
	.cell {
		display: flex;
		box-sizing: border-box;
		border-right: 1px solid #cccccc;
		border-bottom: 1px solid #cccccc;
		justify-content: center;
		align-items: center;
	}
</style>
