<script lang="ts">
	import TreeComponent from './TreeComponent.svelte';

	import { SyntaxNode } from '../../../../../';
	import { SyntaxKind } from '../../../../../src/phase/parsing/syntax.kind';
	import { SyntaxBinaryExpression } from '../../../../../src/phase/parsing/syntax.binary.expression';
	import { SyntaxCompilationUnit } from '../../../../../src/phase/parsing/syntax.compilation.unit';

	const { node }: { node: SyntaxNode } = $props();

	const isNumberToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.NumberToken> => node.kind === SyntaxKind.NumberToken;
	const isIdentifierToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.IdentifierToken> => node.kind === SyntaxKind.IdentifierToken;
	const isEndOfFileToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.EndOfFileToken> => node.kind === SyntaxKind.EndOfFileToken;
	const isCompilationUnit = (node: SyntaxNode): node is SyntaxCompilationUnit => node.kind === SyntaxKind.SyntaxCompilationUnit;
	const isBinaryExpression = (node: SyntaxNode): node is SyntaxBinaryExpression => node.kind === SyntaxKind.SyntaxBinaryExpression;
</script>

<div class={node.class}>
	{#if isCompilationUnit(node)}
		<div>
			{node.kind}
		</div>
		{#each node.statements as statement}
			<TreeComponent node={statement} />
		{/each}
		<TreeComponent node={node.eof} />
	{:else if isEndOfFileToken(node)}
		{node.kind}
	{:else if isNumberToken(node)}
		{node.span.text}
	{:else if isIdentifierToken(node)}
		{node.span.text}
	{:else if isBinaryExpression(node)}
		{node.kind}
		<TreeComponent node={node.left} />
		<div>
			{node.operator.span.text}
		</div>
		<TreeComponent node={node.right} />
	{:else}
		<div class="not-implement">
			{node.kind}
			{node.span.text}
		</div>
	{/if}
</div>

<style lang="scss">
	div {
		width: fit-content;
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
		@extend .highlight;
	}
	.not-implement {
		background-color: #f7f8fb;
		border: 1px solid #d1d9e0;
		@extend .highlight;
	}
	.highlight {
		background-color: #f7f8fb;
		padding: 1px 7px;
		border: 1px solid #d1d9e0;
		margin-block: 4px;
	}
</style>
