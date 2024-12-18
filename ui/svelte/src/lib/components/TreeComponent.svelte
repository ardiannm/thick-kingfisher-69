<script lang="ts">
	import TreeComponent from './TreeComponent.svelte';

	import { SyntaxNode } from '../../../../../';
	import { SyntaxKind } from '../../../../../src/phase/parsing/syntax.kind';
	import { SyntaxBinaryExpression } from '../../../../../src/phase/parsing/syntax.binary.expression';
	import { SyntaxCompilationUnit } from '../../../../../src/phase/parsing/syntax.compilation.unit';

	const { node }: { node: SyntaxNode } = $props();
</script>

<div class={node.class}>
	{#if node.kind === SyntaxKind.NumberToken}
		{node.span.text}
	{:else if node.kind === SyntaxKind.EndOfFileToken}
		{node.kind}
	{:else if node.kind === SyntaxKind.SyntaxCellReference}
		{node.span.text}
	{:else if node.kind === SyntaxKind.SyntaxCompilationUnit}
		<div>{node.kind}</div>
		{#each (node as SyntaxCompilationUnit).statements as statement}
			<TreeComponent node={statement} />
		{/each}
		<TreeComponent node={(node as SyntaxCompilationUnit).eof} />
	{:else if node.kind === SyntaxKind.SyntaxBinaryExpression}
		<div class="operator">{node.kind}</div>
		<TreeComponent node={(node as SyntaxBinaryExpression).left} />
		<div>
			{(node as SyntaxBinaryExpression).operator.span.text}
		</div>
		<TreeComponent node={(node as SyntaxBinaryExpression).right} />
	{:else}
		<div class="not-implement">{node.kind}(Not Implemented): {node.span.text}</div>
	{/if}
</div>

<style>
	div {
		width: fit-content;
	}
	.highlight {
		border: 1px solid #d1d9e0;
		padding: 10px 20px;
		border-radius: 4px;
		background-color: #f7f8fb;
	}
	.syntax-compilation-unit {
		padding: 10px 20px;
		border-radius: 4px;
		background-color: #f7f8fb;
		background-color: white;
		border-radius: 0;
		border: 1px solid;
		width: fit-content;
		min-width: 400px;
		box-shadow:
			rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
			rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
	}
	.syntax-binary-expression {
		display: flex;
		flex-direction: column;
		border-left: 1px solid #d1d9e0;
		padding-left: 30px;
		padding: 1px 10px;
	}
	.number-token {
		display: flex;
		width: fit-content;
		border: 1px solid #d1d9e0;
		background-color: #f7f8fb;
		padding: 1px 7px;
	}
	.not-implement {
		padding: 1px 7px;
		background-color: #f7f8fb;
		border: 1px solid #d1d9e0;
	}
	.operator {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		align-items: center;
		line-height: 1.5;
	}
</style>
