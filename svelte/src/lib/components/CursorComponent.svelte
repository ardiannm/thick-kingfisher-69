<script lang="ts">
	export let x: number = 0;
	export let y: number = 0;
	export let width: number = 2;
	export let height: number = 16;
</script>

<span
	class="cursor"
	style="
        left: {x}px;
        top: {y}px;
        width: {width}px;
        height: {height}px;
    "
></span>

<style scoped lang="scss">
	.cursor {
		position: absolute;
		background-color: black;
		pointer-events: none;
		z-index: 1;
		// animation: blink 1.05s step-end infinite;
	}

	@keyframes blink {
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
