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
		formula?: string
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
	let columnsSpecs = $state<ColumnState>({
		3: {
			width: 100
		}
	})
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
				value: 4,
				formula: `\`\`\` Hello world!

@Component
export class Transaction {

}`
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

	const defaultHeight = $state(21)
	const defaultWidth = $state(70)

	const getHeight = (row: number) => {
		const height = rowsSpecs[row]?.height || defaultHeight
		return height
	}

	const getWidth = (column: number) => {
		const height = columnsSpecs[column]?.width || defaultWidth
		return height
	}

	const setHeight = (column: number) => {
		if (!columnsSpecs[column]) {
			columnsSpecs[column] = { width: defaultWidth }
		}
		columnsSpecs[column].width += 5
	}

	const getValue = (row: number, column: number) => {
		if (row in cellSpecs && column in cellSpecs[row]) return cellSpecs[row][column].value
		return null
	}

	const getFormula = (row: number, column: number) => {
		if (row in cellSpecs && column in cellSpecs[row]) return cellSpecs[row][column].formula || ''
		return ''
	}

	let activeRow = $state(2)
	let activeColumn = $state(4)

	let activeWidth = $derived(getWidth(activeColumn))
	let activeHeight = $derived(getHeight(activeRow))

	let isFormula = $derived(getFormula(activeRow, activeColumn).length > 0)

	const setActive = (row: number, column: number) => {
		activeRow = row
		activeColumn = column
	}

	const isActive = (row: number, column: number) => {
		return activeRow === row && activeColumn === column && showEditor
	}

	let showEditor = $state(true)
</script>

<div class="spreadsheet">
	<div class="frame">
		{#each rows as _, row}
			<div class="row" style="height: {getHeight(row)}px">
				{#each columns as _, column}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="cell" style="width: {isActive(row, column) ? activeWidth : getWidth(column)}px; {isActive(row, column) ? 'justify-content: left; align-items: normal;' : ''}" onmousedown={() => setActive(row, column)} ondblclick={() => (showEditor = true)}>
						{#if isActive(row, column)}
							<Editor text={getFormula(row, column)} style="padding: 2px; {isFormula ? 'padding: 0.5rem; padding-bottom: 1.5rem; padding-right: 7rem;' : ''}; outline: 2px solid #696969; box-sizing: borer-box; position: absolute; z-index: 0; min-width: {activeWidth}px; min-height: {defaultHeight}px; width: auto; box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;" />
						{:else}
							{getValue(row, column)}
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
