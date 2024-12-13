<script lang="ts">
	import { getPosition } from '$lib/Position';
	let { line, column } = $props();
	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = 2;
	let h: number = 16;
	$effect(renderUi);
	function renderUi() {
		const pos = getPosition(line, column);
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		x = pos.x + scrollX;
		y = pos.y + scrollY;
	}
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
<style scoped lang="scss">
	.cursor {
		position: absolute;
		background-color: black;
		pointer-events: none;
		z-index: 1;
		// animation: blink 1.05s step-end infinite;
	}
	@keyframes blink {
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
