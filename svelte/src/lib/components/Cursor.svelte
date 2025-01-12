<script lang="ts">
	import { AppService } from '$lib/services'
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
			const pos = AppService.getCharacterPosition(position, parent)
			if (pos) {
				x = pos.left - parentRect.left
				y = pos.top - parentRect.top
				h = pos.height
			}
		}
	}

	$effect(renderPosition)
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
