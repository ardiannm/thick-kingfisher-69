<script lang="ts">
	export let x: number = 0;
	export let y: number = 0;
	export let width: number = 3;
	export let height: number = 18;
</script>

<span
	style="
		position: absolute;
		left: {x}px;
		top: {y}px;
		width: {width}px;
		height: {height}px;
		background-color: black;
	"
></span>
