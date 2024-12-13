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
<div aria-hidden="true" onmouseenter={renderUi} onmouseleave={() => (show = false)}>
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
		display: flex;
		align-items: center;
		z-index: 9999;
		outline: 1px solid;
		box-shadow:
			rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em,
			rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em,
			rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
	}
</style>
