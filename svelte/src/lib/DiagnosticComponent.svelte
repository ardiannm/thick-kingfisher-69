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
	let height: number = $state(0);

	function renderUi() {
		const from = getPosition(fromLine, fromColumn);
		const to = getPosition(toLine, toColumn);
		x = from.x;
		y = from.y;
		width = to.x - from.x;
		height = from.height;
	}

	$effect(renderUi);
</script>

<svelte:window on:resize={renderUi} on:scroll={renderUi} />

<span
	class="diagnostic"
	style="
	left: {x}px;
	top: {y}px;
	width: {width}px;
	height: {height}px;
	"
></span>

<style lang="scss">
	.diagnostic {
		position: absolute;
		background-color: #ad90f744;
		pointer-events: none;
	}
</style>
