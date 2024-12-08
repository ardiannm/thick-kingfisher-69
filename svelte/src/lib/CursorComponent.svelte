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
	}
</style>
