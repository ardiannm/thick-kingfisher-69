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

	const getColumnHeight = (column: number) => {
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
</script>

<div class="spreadsheet">
	<div class="frame">
		{#each rows as _, i}
			<div class="row" style="height: {getRowHeight(i + 1)}px">
				{#each columns as _, j}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="column" style="width: {getColumnHeight(j + 1)}px" onmousedown={() => increaseColumnHeight(j + 1)}>
						{getCellValue(i + 1, j + 1)}
						{#if i === 4 && j === 4}
							<Editor text="D4+        " style="outline: 2px solid blue; position: absolute; z-index: 0; min-width: {defaultCellWidth}px; min-height: {defaultCellHeight}px; width: fit-content;" />
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
	.column {
		display: flex;
		box-sizing: border-box;
		border-right: 1px solid #cccccc;
		border-bottom: 1px solid #cccccc;
		justify-content: center;
		align-items: center;
	}
</style>
