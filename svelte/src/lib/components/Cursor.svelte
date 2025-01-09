<script lang="ts">
	import { getPosition } from '$lib';
	import type { Snippet } from 'svelte';

	let { line, column, children }: { line: number; column: number; children?: Snippet } = $props();

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

<span
	class="cursor"
	style="
			left: {x}px;
			top: {y}px;
			width: {w}px;
			height: {h}px;
		"
>
	{#if children}
		{@render children()}
	{/if}
</span>

<style scoped>
	.cursor {
		position: absolute;
		pointer-events: none;
		z-index: 10;
		min-width: 1px;
		overflow: hidden;
		white-space: pre;
		background-color: #d4d4d4;
		opacity: 0.9;
	}
</style>
