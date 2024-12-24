<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let { children, render, offsetX = 0, offsetY = 0, show = false }: { children: Snippet; render: Snippet; offsetX?: number; offsetY?: number; show?: boolean; line?: number; column?: number } = $props();

	let x = $state(0);
	let y = $state(0);

	let wrapper: HTMLSpanElement | null = null;

	function renderUi() {
		if (wrapper) {
			const content = wrapper.children[0] as HTMLElement; // considering only the first child; alternatively we could iterate through all the children to construct a bounding client rect.
			const pos = content.getBoundingClientRect();
			x = pos.left + offsetX;
			y = pos.top + pos.height + offsetY;
		}
	}

	$effect(() => {
		if (show) {
			renderUi();
		}
	});

	onMount(() => {
		if (show) {
			show = false;
			setTimeout(() => {
				show = true;
				renderUi();
			});
		}
	});
</script>

<span bind:this={wrapper} tabindex="-1" aria-hidden="true" onmouseenter={() => (show = true)} onmouseleave={() => (show = false)}>
	{@render children()}
</span>

{#if show}
	<div class="tooltip" style="left: {x}px; top: {y}px;">
		{@render render()}
	</div>
{/if}

<style>
	.tooltip {
		position: absolute;
		background-color: transparent;
		display: flex;
		align-items: center;
		z-index: 9999;
		flex-direction: row;
		pointer-events: none;
	}
</style>
