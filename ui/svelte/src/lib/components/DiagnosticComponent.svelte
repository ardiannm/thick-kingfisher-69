<script lang="ts">
	import TooltipComponent from './TooltipComponent.svelte';
	import type { Diagnostic } from '../../../../../src/analysis/diagnostics/diagnostic';
	import { getPosition } from '../Position';
	import { onDestroy, onMount } from 'svelte';
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
	const handleScroll = () => renderUi();
	onMount(() => {
		if (typeof document !== 'undefined') {
			const e = document.querySelector('#space');
			if (e) {
				e.addEventListener('scroll', handleScroll);
			}
		}
	});
	onDestroy(() => {
		if (typeof document !== 'undefined') {
			const e = document.querySelector('#space');
			if (e) {
				e.removeEventListener('scroll', handleScroll);
			}
		}
	});
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
		background-color: #fafad2;
	}
</style>
