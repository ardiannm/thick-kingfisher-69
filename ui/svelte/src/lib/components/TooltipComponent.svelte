<script lang="ts">
	import type { Snippet } from 'svelte';
	let { message, children }: { message: Snippet; children: Snippet } = $props();
	let x = $state(0);
	let y = $state(0);
	let show = $state(false);
	function renderUi(event: MouseEvent) {
		x = event.pageX + 5;
		y = event.pageY - 20;
		show = true;
	}
</script>
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div 
	aria-hidden="true" 
	onmouseenter={renderUi} 
	onmouseleave={() => show = false} 
>
	{@render children()}
</div>
{#if show}
	<div class="tooltip" style="top: {y}px; left: {x}px;">
		{@render message()}
	</div>
{/if}
<style>
	.tooltip {
		position: absolute;
		padding: 1px 7px;
		background-color: white;
		box-shadow: 0px 3px 8px #0000003d;
		display: flex;
		align-items: center;
		z-index: 9999;
	}
</style>
