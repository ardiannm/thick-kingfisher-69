<script lang="ts">
	import { getPosition } from './Position';

	let { diagnostic } = $props();

	let fromLine: number = $derived(diagnostic.span.line);
	let toLine: number = $derived(diagnostic.span.line);
	let fromColumn: number = $derived(diagnostic.span.column);
	let toColumn: number = $derived(diagnostic.span.column + diagnostic.span.length);

	let x: number = $state(0);
	let y: number = $state(0);
	let width: number = $state(0);

	function renderUi() {
		const from = getPosition(fromLine, fromColumn);
		const to = getPosition(toLine, toColumn);
		x = from.x - 1;
		y = from.y;
		width = to.x - from.x + 1;
	}

	$effect(renderUi);
</script>

<svelte:window on:resize={renderUi} on:scroll={renderUi} />

<span
	class="diagnostic"
	style="
		position: absolute;
		left: {x}px;
		top: {y}px;
		width: {width}px;
		height: {15}px;
	"
></span>

<style>
	.diagnostic {
		position: absolute;
		background-color: #4cdd973b;
		cursor: pointer;
	}
</style>
