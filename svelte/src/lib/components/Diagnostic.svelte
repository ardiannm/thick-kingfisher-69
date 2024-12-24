<script lang="ts">
	import Tooltip from './Tooltip.svelte';
	import { getPosition } from '../Position';
	import type { Diagnostic } from '../../../..';

	let { diagnostic }: { diagnostic: Diagnostic } = $props();

	let x: number = $state(0);
	let y: number = $state(0);
	let w: number = $state(0);
	let h: number = $state(0);

	let show = $state(false);

	$effect(renderUi);

	function renderUi() {
		const line = diagnostic.span.from.line;
		const column = diagnostic.span.from.column;
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

<Tooltip>
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
	{#snippet render()}
		<div class="message">
			{diagnostic.message}
		</div>
	{/snippet}
</Tooltip>

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #c9c3e6d2;
		min-width: 5px;
		opacity: 1;
		&:hover {
			z-index: 100;
			outline: 1px solid #2a2a2a;
			box-shadow:
				rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
				rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
		}
	}
	.message {
		padding: 1px 7px;
		background-color: white;
		outline: 1px solid;
	}
</style>
