<script lang="ts">
	import type { Snippet } from 'svelte'
	const { menu, content }: { menu?: Snippet; content?: Snippet } = $props()
</script>

<div class="app">
	<div class="menu">
		{#if menu}
			{@render menu()}
		{/if}
	</div>
	<div class="content">
		{#if content}
			{@render content()}
		{/if}
	</div>
</div>

<style lang="scss">
	.app {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}
	.menu {
		display: flex;
		width: 100%;
		height: fit-content;
		min-height: 40px;
		border: 1px solid #cccccc;
		align-items: center;
		padding: 4px 20px;
	}
	.content {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
</style>
