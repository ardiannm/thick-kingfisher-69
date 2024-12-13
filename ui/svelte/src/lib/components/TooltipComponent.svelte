<script lang="ts">
	export let title = '';
	let isHovered = false;
	let x: number;
	let y: number;

	function mouseOver(event: MouseEvent) {
		isHovered = true;
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseMove(event: MouseEvent) {
		x = event.pageX + 5;
		y = event.pageY + 5;
	}
	function mouseLeave() {
		isHovered = false;
	}
</script>
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div
	aria-hidden="true"
	onmouseover={mouseOver}
	onmouseleave={mouseLeave}
	onmousemove={mouseMove}
>
	<slot></slot>
</div>
{#if isHovered}
	<div class="tooltip" style="top: {y}px; left: {x}px;">{title}</div>
{/if}
<style>
	.tooltip {
		position: absolute;
        padding: 1px 7px;
		background-color: white;
		box-shadow: 0px 3px 8px #0000003d;
        display: flex;
        align-items: center;
	}
</style>
