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
		outline: 1px solid #d1d9e0;
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
		background-color: #c9c3e6d2;
		padding: 1px 7px;
		margin-top: 4px;
	}
	.not-implement {
		color: #645fa1;
	}
	.operator {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		align-items: center;
		line-height: 1.5;
	}
</style>
