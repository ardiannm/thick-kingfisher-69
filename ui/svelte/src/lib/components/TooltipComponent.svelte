<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let { message, children, offsetX = 0, offsetY = 0, show = false }: { message: Snippet; children: Snippet; offsetX?: number; offsetY?: number; show?: boolean } = $props();

	let x = $state(0);

	let y = $state(0);

	let wrapper: HTMLSpanElement | null = null;

	function renderUi() {
		if (wrapper) {
			const content = wrapper.children[0] as HTMLElement; // considering only the first child; alternatively we could iterate through all the children to construct a bounding client rect.
			const pos = content.getBoundingClientRect();
			x = pos.left + offsetX;
			y = pos.top + pos.height + offsetY;
			show = true;
		}
	}

	onMount(() => {
		if (show) {
			show = false;
			setTimeout(() => {
				show = true;
				renderUi();
			});
		}
	});

	$effect(() => {
		if (show) {
			renderUi();
		}
	});
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<span bind:this={wrapper} tabindex="-1" aria-hidden="true" onmouseenter={renderUi} onmouseleave={() => (show = false)}>
	{@render children()}
</span>
{#if show}
	<div class="tooltip" style="top: {y}px; left: {x}px;">
		{@render message()}
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
