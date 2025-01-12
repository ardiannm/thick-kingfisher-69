<script lang="ts">
	import { onMount } from 'svelte'

	let { position }: { position: number } = $props()

	let parent: HTMLElement
	let component: HTMLElement

	let x = $state(0)
	let y = $state(0)
	let h = $state(0)

	let show = $state(false)

	onMount(() => {
		show = true
	})

	const renderPosition = () => {
		if (component && component.parentElement) {
			parent = component.parentElement
			const style = getComputedStyle(parent)
			const parentRect = ['relative', 'absolute', 'fixed'].includes(style.position) ? parent.getBoundingClientRect() : ({ left: 0, top: 0 } as DOMRect)
			const pos = getCharacterPosition(position)
			if (pos) {
				x = pos.left - parentRect.left
				y = pos.top - parentRect.top
				h = pos.height
			}
		}
	}

	$effect(renderPosition)

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

<div bind:this={component} style="left: {x}px; top: {y}px; height: {h}px; display: {show ? 'block' : 'none'};"></div>

<style lang="scss" scoped>
	div {
		position: absolute;
		background-color: black;
		width: 1px;
		z-index: 10;
		pointer-events: none;
	}
</style>
