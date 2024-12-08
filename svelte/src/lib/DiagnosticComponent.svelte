<script lang="ts">
	import { getPosition } from './Position';

	let { line, column, length } = $props();

	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = $state(0);
	let h: number = $state(0);

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

<svelte:window on:resize={renderUi} on:scroll={renderUi} />

<span
	class="diagnostic"
	style="
	left: {x}px;
	top: {y}px;
	width: {w}px;
	height: {h}px;
	"
></span>

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #ad90f744;
		pointer-events: none;
	}
</style>
