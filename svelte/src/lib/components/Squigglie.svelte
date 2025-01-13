<script lang="ts">
	import { AppService } from '$lib/services'

	let { start, end, text = '' }: { start: number; end: number; text?: string } = $props()

	let parent: HTMLElement
	let component: HTMLElement

	let x = $state(0)
	let y = $state(0)
	let w = $state(0)
	let h = $state(7)

	$effect(() => {
		if (component && component.parentElement) {
			parent = component.parentElement
			const style = getComputedStyle(parent)
			const parentRect = ['relative', 'absolute', 'fixed'].includes(style.position) ? parent.getBoundingClientRect() : ({ left: 0, top: 0 } as DOMRect)
			const from = AppService.getCharacterPosition(start, parent)
			const to = AppService.getCharacterPosition(end, parent)
			if (from && to) {
				x = from.left - parentRect.left
				y = from.top + from.height - 3 - parentRect.top
				const width = to.left - from.left
				w = width ? width : 6
			}
		}
	})

	let show = $state(false)

	const showText = () => (show = true)
	const hideText = () => (show = false)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={component} style="left: {x}px; top: {y}px; width: {w}px;" onmouseenter={showText} onmouseleave={hideText}>
	{#if text && show}
		<span style="left: {Math.max(w - 17, 0)}px; top: {h}px;">^^^ {text}</span>
	{/if}
</div>

<style lang="scss" scoped>
	div {
		position: absolute;
		cursor: pointer;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 3"><path d="M0 2 Q 1 0 3 2 T 6 2" fill="none" stroke="%23e6007a" stroke-width="1" stroke-linecap="round"/></svg>') repeat-x;
		background-size: 6px 4px;
		height: 4px;
		z-index: 1;
	}
	span {
		position: absolute;
		white-space: nowrap;
		color: #e6007a;
	}
</style>
