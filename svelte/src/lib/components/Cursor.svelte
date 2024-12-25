<script lang="ts">
	import { getPosition } from '$lib';
	import type { Snippet } from 'svelte';
	import Tooltip from './Tooltip.svelte';

	let { line, column, showTooltip, children }: { line: number; column: number; showTooltip?: boolean; children?: Snippet } = $props();

	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = 2;
	let h: number = 16;

	function renderUi() {
		const pos = getPosition(line, column);
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		x = pos.x + scrollX;
		y = pos.y + scrollY;
	}

	$effect(renderUi);
</script>

<svelte:window on:keydown={renderUi} on:resize={renderUi} on:scroll={renderUi} />

{#snippet cursor()}
	<span
		class="cursor"
		style="
			left: {x}px;
			top: {y}px;
			width: {w}px;
			height: {h}px;
		"
	></span>
{/snippet}

{#if children}
	<Tooltip show={showTooltip} direction="bottom">
		{@render cursor()}
		{#snippet render()}
			{@render children()}
		{/snippet}
	</Tooltip>
{:else}
	{@render cursor()}
{/if}

<style scoped>
	.cursor {
		position: absolute;
		background-color: black;
		pointer-events: none;
		z-index: 10;
	}
</style>
