<script lang="ts">
	import { getPosition } from '$lib'

	// FIXME: this cursor needs to have only one position parameter to determine which character it needs to grab from the parent
	let { line, column }: { line: number; column: number } = $props()
	
	let x: number = $state(0)
	let y: number = $state(0)
	let w: number = 2
	let h: number = 16
	
	function renderUi() {
		// FIXME: find a way to make this cursor grab the nth character's positions and render itself
		const pos = getPosition(line, column)
		const scrollX = window.scrollX
		const scrollY = window.scrollY
		x = pos.x + scrollX
		y = pos.y + scrollY
	}

	$effect(renderUi)
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
>
</span>

<style scoped>
	.cursor {
		position: absolute;
		pointer-events: none;
		z-index: 10;
		min-width: 1px;
		overflow: hidden;
		white-space: pre;
		background-color: black;
		opacity: 0.9;
	}
</style>
