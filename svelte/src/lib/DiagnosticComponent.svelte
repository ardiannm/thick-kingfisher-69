<script lang="ts">
	import type { Position } from './Position';

	export let from: Position;
	export let to: Position = from;
	export let width: number = to.x - from.x;
	export let height: number = 15;
</script>

<span
	class="diagnostic"
	style="
		position: absolute;
		left: {from.x}px;
		top: {from.y}px;
		width: {width}px;
		height: {height}px;
	"
></span>

<style>
	.diagnostic {
		position: absolute;
		border-bottom: 1px solid red;
		background-color: rgba(255, 0, 0, 0.11);
		cursor: pointer;
	}
</style>
