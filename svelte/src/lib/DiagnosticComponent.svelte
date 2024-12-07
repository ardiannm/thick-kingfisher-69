<script lang="ts">
	import { onMount } from 'svelte';
	import { getPosition } from './Position';


	let {fromLine, fromColumn, toLine, toColumn} = $props()
	
	let x: number = $state(0);
	let y: number = $state(0);
	let width: number = $state(0);
	let height: number = 15;

	onMount(renderUi);

	function renderUi() {
		const from = getPosition(fromLine, fromColumn);
		const to = getPosition(toLine, toColumn);
		x = from.x - 1;
		y = from.y;
		width = to.x - from.x + 1;
	}
	$effect(renderUi)
	
</script>

<svelte:window on:resize={renderUi} on:scroll={renderUi} />

<span
	class="diagnostic"
	style="
		position: absolute;
		left: {x}px;
		top: {y}px;
		width: {width}px;
		height: {height}px;
	"
></span>

<style>
	.diagnostic {
		position: absolute;
		background-color: #4cdd973b;
		cursor: pointer;
	}
</style>
