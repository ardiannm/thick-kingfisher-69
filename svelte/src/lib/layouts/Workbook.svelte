<script lang="ts">
	import type { Snippet } from 'svelte'
	const { sidebarContent, workspaceContent }: { sidebarContent?: Snippet; workspaceContent?: Snippet } = $props()
</script>

<div class="spreadsheet-layout">
	<div class="container">
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
</div>

<style lang="scss">
	.spreadsheet-layout {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		height: 100%;
		width: 100%;
	}
	.container {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
	}
	.sidebar {
		display: flex;
		width: 400px;
		height: 100%;
	}
	.workspace {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
</style>
