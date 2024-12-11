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
		x = p1.x;
		y = p1.y;
		w = p2.x - p1.x;
		h = p1.height;
	}
</script>

<svelte:window onresize={renderUi} onscroll={renderUi} />

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
		class="message tooltip"
		style="
	left: {x + w}px;
	top: {y - h - 6}px;
	">{message}</span
	>
{/if}

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #ad90f744;
	}
	.message {
		position: absolute;
		width: fit-content;
		height: fit-content;
		background-color: white;
		z-index: 3;
	}
	.tooltip {
		background-color: #f7f8fb;
		padding: 3px 10px;
		border-radius: 2px;
		box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
		border-bottom-left-radius: 0px;
	}
</style>
