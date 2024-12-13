<script lang="ts">
	import TooltipComponent from './TooltipComponent.svelte';
	import type { Diagnostic } from '../../../../../src/analysis/diagnostics/diagnostic';
	import { getPosition } from '../Position';
	let { diagnostic }: { diagnostic: Diagnostic } = $props();
	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = $state(0);
	let h: number = $state(0);
	let show = $state(false);
	$effect(renderUi);
	function renderUi() {
		const line = diagnostic.span.line;
		const column = diagnostic.span.column;
		const length = diagnostic.span.length || 1;
		const p1 = getPosition(line, column);
		const p2 = getPosition(line, column + length);
		x = p1.x + window.scrollX;
		y = p1.y + window.scrollY;
		w = p2.x - p1.x;
		h = p1.height;
	}
	function toggleShow() {
		show = !show;
	}
</script>

<svelte:window on:keydown={renderUi} on:resize={renderUi} on:scroll={renderUi} />

<TooltipComponent>
	<span
		role="tooltip"
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
	{#snippet message()}
		{diagnostic.message}
	{/snippet}
</TooltipComponent>

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #aec7e08a;
	}
</style>
