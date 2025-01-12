<script lang="ts">
	import type { Snippet } from 'svelte'

	let { start, end }: { start: number; end: number } = $props()

	let parent: HTMLElement
	let component: HTMLElement

	let x = $state(0)
	let y = $state(0)
	let w = $state(0)

	$effect(() => {
		if (component && component.parentElement) {
			parent = component.parentElement
			const from = getCharacterPosition(start)
			const to = getCharacterPosition(end)
			if (from && to) {
				x = from.left
				y = from.top + from.height - 3
				const width = to.left - from.left
				w = width ? width : 6
			}
		}
	})

	const getCharacterPosition = (n: number) => {
		const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null)
		let charIndex = 0
		while (walker.nextNode()) {
			const node = walker.currentNode
			const text = node.textContent || ''
			if (charIndex + text.length > n) {
				const localIndex = n - charIndex
				if (localIndex >= text.length) {
					console.error(`Invalid local index: ${localIndex} exceeds node length`)
					return null
				}
				const range = document.createRange()
				range.setStart(node, localIndex)
				range.setEnd(node, localIndex + 1)
				const rect = range.getBoundingClientRect()
				range.detach()
				return rect
			}
			charIndex += text.length
		}
		console.error(`Character position ${n} is out of bounds`)
		return null
	}
</script>

<div bind:this={component} style="left: {x}px; top: {y}px; width: {w}px;"></div>

<style lang="scss" scoped>
	div {
		position: absolute;
		cursor: pointer;
		background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 3"><path d="M0 2 Q 1 0 3 2 T 6 2" fill="none" stroke="%23e6007a" stroke-width="1" stroke-linecap="round"/></svg>') repeat-x;
		background-size: 6px 4px;
		height: 4px;
	}
</style>
