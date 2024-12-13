<script lang="ts">
	import type { Diagnostic } from '../../../../../src/analysis/diagnostics/diagnostic';
	import { getPosition } from '../Position';
	let { diagnostic }: {diagnostic: Diagnostic} = $props();
	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = $state(0);
	let h: number = $state(0);
	let show = $state(false);
	$effect(renderUi);
	function renderUi() {
		const p1 = getPosition(diagnostic.span.line, diagnostic.span.column);
		const p2 = getPosition(diagnostic.span.line, diagnostic.span.column + (diagnostic.span.length || 1));
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		x = p1.x + scrollX;
		y = p1.y + scrollY;
		w = p2.x - p1.x;
		h = p1.height;
	}
	function toggleShow() {
		show = !show
	}
</script>
<svelte:window on:keydown={renderUi} on:resize={renderUi} on:scroll={renderUi} />
<span
	aria-hidden="true"
	onmouseenter={toggleShow}
	onmouseleave={toggleShow}
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
	">{diagnostic.message}</span
	>
{/if}
<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #aec7e08a;
	}
	.tooltip {
		position: absolute;
		width: fit-content;
		height: fit-content;
		z-index: 3;
		padding: 1px 7px;
		background-color: white;
		box-shadow: 0px 3px 8px #0000003d;
	}
</style>
