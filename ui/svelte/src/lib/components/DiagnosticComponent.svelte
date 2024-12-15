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
		const upToColumn = column + length;
		const pos1 = getPosition(line, column);
		const pos2 = getPosition(line, upToColumn);
		x = pos1.x + window.scrollX;
		y = pos1.y + window.scrollY;
		w = pos2.x - pos1.x;
		h = pos1.height;
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
		background-color: #c9c3e6d2;
		opacity: 0.5;
		&:hover {
			opacity: 1;
			outline: 1px solid #2a2a2a;
			box-shadow:
				rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
				rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
		}
	}
</style>
