<script lang="ts">
	import Tree from './Tree.svelte';

	import { SyntaxBinaryExpression, SyntaxCompilationUnit, SyntaxNode, SyntaxUnaryExpression, SyntaxKind } from '../../../..';
	import type { SyntaxParenthesis } from '../../../../src/phase/parsing/syntax.parenthesis';
	import type { SyntaxCellReference } from '../../../../src/phase/parsing/syntax.cell.reference';

	const { node }: { node: SyntaxNode } = $props();

	const isNumberToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.NumberToken> => node.kind === SyntaxKind.NumberToken;
	const isIdentifierToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.IdentifierToken> => node.kind === SyntaxKind.IdentifierToken;
	const isEndOfFileToken = (node: SyntaxNode): node is SyntaxNode<SyntaxKind.EndOfFileToken> => node.kind === SyntaxKind.EndOfFileToken;
	const isCompilationUnit = (node: SyntaxNode): node is SyntaxCompilationUnit => node.kind === SyntaxKind.SyntaxCompilationUnit;
	const isBinaryExpression = (node: SyntaxNode): node is SyntaxBinaryExpression => node.kind === SyntaxKind.SyntaxBinaryExpression;
	const isUnaryExpression = (node: SyntaxNode): node is SyntaxUnaryExpression => node.kind === SyntaxKind.SyntaxUnaryExpression;
	const isParenthesisExpression = (node: SyntaxNode): node is SyntaxParenthesis => node.kind === SyntaxKind.SyntaxParenthesis;
	const isSyntaxCellReference = (node: SyntaxNode): node is SyntaxCellReference => node.kind === SyntaxKind.SyntaxCellReference;
</script>

<div class={node.class}>
	{#if isCompilationUnit(node)}
		<div>
			{node.kind}
		</div>
		{#each node.statements as statement}
			<Tree node={statement}></Tree>
		{/each}
		<Tree node={node.eof}></Tree>
	{:else if isEndOfFileToken(node)}
		{node.kind}
	{:else if isNumberToken(node)}
		{node.span.text}
	{:else if isIdentifierToken(node)}
		{node.span.text}
	{:else if isSyntaxCellReference(node)}
		{node.kind}
		<div class="name">{node.span.text}</div>
	{:else if isParenthesisExpression(node)}
		{node.kind}
		<Tree node={node.expression}></Tree>
	{:else if isBinaryExpression(node)}
		{node.kind}
		<Tree node={node.left}></Tree>
		<div class="operator">
			{node.operator.span.text}
		</div>
		<Tree node={node.right}></Tree>
	{:else if isUnaryExpression(node)}
		{node.kind}
		<div class="operator">
			{node.operator.span.text}
		</div>
		<Tree node={node.right}></Tree>
	{:else}
		<div class="not-implement">
			{node.kind}
		</div>
	{/if}
</div>

<style lang="scss">
	.operator {
		margin-left: 8px;
	}
	.syntax-compilation-unit {
		padding: 30px;
		border-radius: 4px;
		background-color: white;
		border-radius: 0;
		width: fit-content;
		min-width: 500px;
		background-color: #ffffff;
		border: 1px solid;
	}

	.syntax-unary-expression,
	.syntax-binary-expression,
	.syntax-cell-reference,
	.syntax-parenthesis {
		display: flex;
		flex-direction: column;
		border-left: 1px solid #4c3dc4;
		padding-left: 30px;
		padding: 1px 10px;
	}
	.number-token,
	.identifier-token {
		display: flex;
		width: fit-content;
		@extend .highlight;
	}
	.not-implement {
		@extend .highlight;
	}
	.highlight {
		padding: 1px 7px;
		margin-block: 4px;
		margin-left: 4px;
		width: fit-content;
		background-color: #eeeef0;
	}
	.syntax-cell-reference {
		display: flex;
		flex-direction: column;
		.name {
			@extend .highlight;
		}
	}
</style>
