<script lang="ts">
	import type { SyntaxNode } from '../../../..';

	const { node }: { node: SyntaxNode } = $props();
</script>

<div class="tree">
	{JSON.stringify(node.toJson())}
</div>

<style lang="scss">
	.tree {
		padding: 30px;
		border-radius: 4px;
		border-radius: 0;
		width: fit-content;
		min-width: 500px;
		max-width: 500px;
		background-color: #292929;
		color: #808080;
		border-radius: 2px;
		height: fit-content;
		max-height: 500px;
		z-index: 1000000;
		box-shadow:
			#43475545 0px 0px 0.25em,
			#5a7dbc0d 0px 0.25em 1em;
	}
</style>
