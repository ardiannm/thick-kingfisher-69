<script lang="ts">
	import Tooltip from './Tooltip.svelte'
	import { getPosition } from '../Position'

	let { line, column, length = 1, message }: { line: number; column: number; length: number; message: string } = $props()

	let x: number = $state(0)
	let y: number = $state(0)
	let w: number = $state(0)
	let h: number = $state(0)

	let show = $state(false)

	const toggleShow = () => (show = !show)

	const renderUi = () => {
		const upToColumn = column + length
		const pos1 = getPosition(line, column)
		const pos2 = getPosition(line, upToColumn)
		x = pos1.x + window.scrollX
		y = pos1.y + window.scrollY
		w = pos2.x - pos1.x
		h = pos1.height
	}

	$effect(renderUi)
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
	{#snippet component()}
		<div
			class="message"
			style="
				top: {h + 2}px;
				width: {w}px;
			"
		>
			^^^ {message}
		</div>
	{/snippet}
</Tooltip>

<style lang="scss">
	.diagnostic {
		position: absolute;
		min-width: 5px;
		opacity: 1;
		cursor: pointer;
	}
	.diagnostic::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4px; /* Height of the squiggle */
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="6" height="4" viewBox="0 0 6 3"><path d="M0 2 Q 1 0 3 2 T 6 2" fill="none" stroke="%23e6007a" stroke-width="1" stroke-linecap="round"/></svg>') repeat-x;
		background-size: 5px 5px; /* Match the adjusted SVG dimensions */
		stroke: black;
		z-index: 2;
	}
	.message {
		position: absolute;
		align-items: center;
		width: fit-content;
		white-space: pre;
		color: #e6007a;
	}
</style>
