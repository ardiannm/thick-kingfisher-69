<script lang="ts">
	import { getPosition } from '../Position';

	let { line, column, length, message } = $props();

	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = $state(0);
	let h: number = $state(0);

	let show = $state(false);

	$effect(renderUi);

	function renderUi() {
		const p1 = getPosition(line, column);
		const p2 = getPosition(line, column + (length || 1));
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		x = p1.x + scrollX;
		y = p1.y + scrollY;
		w = p2.x - p1.x;
		h = p1.height;
	}
</script>

<svelte:window on:keydown={renderUi} on:resize={renderUi} on:scroll={renderUi} />

<span
	aria-hidden="true"
	onmouseenter={() => (show = true)}
	onmouseleave={() => (show = false)}
	class="diagnostic"
	style="
	left: {x}px;
	top: {y}px;
	width: {w}px;
	height: {h}px;
	"
></span>

{#if show}
	<span
		class="tooltip"
		style="
	left: {x + w}px;
	top: {y - h - 2.5}px;
	">{message}</span
	>
{/if}

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #a7d7ffa8;
	}
	.tooltip {
		position: absolute;
		width: fit-content;
		height: fit-content;
		z-index: 3;
		padding: 1px 10px;
		box-shadow:
			0px 4px 8px -2px rgba(9, 30, 66, 0.25),
			0px 0px 0px 1px #d9d9e3;
		background-color: white;
	}
</style>
