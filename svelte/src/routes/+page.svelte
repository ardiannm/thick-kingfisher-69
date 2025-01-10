<script lang="ts">
	import Editor from '$lib/components/Editor.svelte'
	import Spreadsheet from './../lib/components/Spreadsheet.svelte'
	import Workbook from '../lib/layouts/Workbook.svelte'

	let text = `A1 = 0
A2 = A1 + 2
A1 = 1
A2	\`\`\` value should be 3

1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10`
</script>

<Workbook>
	{#snippet sidebarContent()}
		<Editor {text} />
	{/snippet}
	{#snippet workspaceContent()}
		<Spreadsheet />
	{/snippet}
</Workbook>
