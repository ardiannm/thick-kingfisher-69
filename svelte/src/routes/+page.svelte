<script lang="ts">
	import Editor from '$lib/components/Editor.svelte'
	import Spreadsheet from './../lib/components/Spreadsheet.svelte'
	import Workbook from '../lib/layouts/Workbook.svelte'

	let text = `A1 = 0
A2 = A1 + 3
A3 = A1 + A2
A3	\`\`\` value should be 3

A1 = 1
A3	\`\`\` value should be 5

1+2+           `
</script>

<Workbook>
	{#snippet sidebarContent()}
		<Editor {text} />
	{/snippet}
	{#snippet workspaceContent()}
		<Spreadsheet />
	{/snippet}
</Workbook>
