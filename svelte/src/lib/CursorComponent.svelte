<script lang="ts">
	export let x: number = 0;
	export let y: number = 0;
	export let width: number = 3;
	export let height: number = 17;
</script>

<span
	style="
		position: absolute;
		left: {x - 1}px;
		top: {y - 2}px;
		width: {width}px;
		height: {height + 2}px;
		background-color: black;
	"
></span>
