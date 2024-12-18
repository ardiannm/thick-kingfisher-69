<script lang="ts">
	import { getPosition } from '$lib';

	let { line, column } = $props();

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
></span>

<style scoped>
	.cursor {
		position: absolute;
		background-color: black;
		pointer-events: none;
		z-index: 1000;
	}
</style>
