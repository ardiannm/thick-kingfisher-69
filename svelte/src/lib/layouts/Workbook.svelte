<script lang="ts">
	import type { Snippet } from 'svelte'
	const { sidebarContent, workspaceContent }: { sidebarContent?: Snippet; workspaceContent?: Snippet } = $props()
</script>

<div class="workbook">
	<div class="sidebar">
		{#if sidebarContent}
			{@render sidebarContent()}
		{/if}
	</div>
	<div class="workspace">
		{#if workspaceContent}
			{@render workspaceContent()}
		{/if}
	</div>
</div>

<style lang="scss">
	.workbook {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		width: 400px;
		min-width: 400px;
		height: 100%;
		border: 1px solid #cccccc;
	}
	.workspace {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
</style>
