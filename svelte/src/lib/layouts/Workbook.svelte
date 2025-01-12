<script lang="ts">
	import type { Snippet } from 'svelte'
	const { sidebar, workspace }: { sidebar?: Snippet; workspace?: Snippet } = $props()
</script>

<div class="workbook">
	<div class="sidebar">
		{#if sidebar}
			{@render sidebar()}
		{/if}
	</div>
	<div class="workspace">
		{#if workspace}
			{@render workspace()}
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
