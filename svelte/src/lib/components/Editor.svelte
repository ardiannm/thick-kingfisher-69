<script lang="ts">
	import { onMount } from 'svelte';
	import { Evaluator, SyntaxTree } from '../../../..';

	import Cursor from './Cursor.svelte';
	import Diagnostic from './Diagnostic.svelte';
	import Tree from './Tree.svelte';

	let { text }: { text: string } = $props();

	const tree = $derived(SyntaxTree.createFrom(text));

	const lines = $derived(tree.source.getLines());
	const diagnostics = $derived(tree.source.diagnostics.bag);

	// svelte-ignore state_referenced_locally
	let cursor = $state(text.length);
	let line = $derived(tree.source.getLine(cursor).number);
	let column = $derived(tree.source.getColumn(cursor));
	let currentLine = $derived(tree.source.getLine(cursor));
	let tokens = $derived(tree.source.tokens);

	let showCursor = $state(false);
	let showTree = $state(false);

	let value = $derived(Evaluator.evaluate(tree));

	// svelte-ignore state_referenced_locally
	let prevColumn = column;

	function handleKey(event: KeyboardEvent) {
		showCursor = true;
		const input = event.key;
		if (event.code == 'AltRight' && event.altKey) {
			event.preventDefault();
			showTree = !showTree;
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			event.preventDefault();
			moveToNextToken();
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
			event.preventDefault();
			moveToPrevToken();
		} else if (input === 'ArrowUp' && event.shiftKey && event.altKey) {
			event.preventDefault();
			duplicateLine(0);
		} else if (input === 'ArrowDown' && event.shiftKey && event.altKey) {
			event.preventDefault();
			duplicateLine(+1);
		} else if (input === 'ArrowDown' && event.altKey) {
			event.preventDefault();
			moveLine(+1);
		} else if (input === 'ArrowUp' && event.altKey) {
			event.preventDefault();
			moveLine(-1);
		} else if (input === 'x' && event.ctrlKey) {
			event.preventDefault();
			removeLine();
		} else if (input === 'ArrowRight') {
			event.preventDefault();
			moveCursorX(+1);
		} else if (input === 'ArrowLeft') {
			event.preventDefault();
			moveCursorX(-1);
		} else if (input === 'ArrowDown') {
			event.preventDefault();
			moveCursorY(+1);
		} else if (input === 'ArrowUp') {
			event.preventDefault();
			moveCursorY(-1);
		} else if (input === 'Enter') {
			event.preventDefault();
			insertText();
		} else if (input === 'Backspace') {
			event.preventDefault();
			backspace();
		} else if (input === 'Delete') {
			event.preventDefault();
			moveCursorX(+1);
			removeText();
			moveCursorX(-1);
		} else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
			event.preventDefault();
			insertText(input);
		}
	}

	function moveLine(step: number) {
		const nextLine = line + step;
		const nextTree = tree.source.swapLines(line, nextLine);
		if (!nextTree) return;
		text = nextTree;
		cursor = tree.source.getPosition(nextLine, prevColumn);
	}

	function backspace() {
		removeText();
		moveCursorX(-1);
	}

	function moveCursorX(step: number) {
		const newPos = cursor + step;
		if (newPos >= 0 && newPos <= text.length) {
			cursor = newPos;
			prevColumn = column;
		}
	}

	function moveCursorY(steps: number) {
		const prevLine = line + steps;
		if (prevLine > 0) {
			const pos = tree.source.getPosition(prevLine, prevColumn);
			cursor = pos;
		} else {
			prevColumn = 1;
			cursor = 0;
		}
	}

	function insertText(charText: string = '\n') {
		text = text.substring(0, cursor) + charText + text.substring(cursor);
		cursor += 1;
	}

	function removeText() {
		text = text.substring(0, cursor - 1) + text.substring(cursor);
	}

	function removeLine() {
		const span = currentLine.fullSpan;
		if (span.length === 0) {
			backspace();
		} else {
			text = text.slice(0, span.start) + text.slice(span.end);
			cursor = span.start;
		}
	}

	function duplicateLine(step: number) {
		text = tree.source.duplicateLine(line);
		const ln = line;
		cursor = tree.source.getPosition(ln + step, prevColumn);
	}

	function moveToPrevToken() {
		const position = tree.source.getPosition(line, column);
		let index = tree.source.getTokenLocation(position - 1);
		let token = tokens[index];
		while (token && token.isPunctuation()) {
			index--;
			token = tokens[index];
		}
		cursor = token.span.start;
	}

	function moveToNextToken() {
		const position = tree.source.getPosition(line, column);
		let index = tree.source.getTokenLocation(position + 1);
		let token = tokens[index];
		while (token && token.isPunctuation()) {
			index++;
			token = tokens[index];
		}
		if (token) {
			cursor = token.span.end;
		} else {
			cursor = text.length;
		}
	}

	onMount(() => (showCursor = true));
</script>

<svelte:window on:keydown={handleKey} />

<div class="editor">
	<div class="highlight todo">
		<span>display the syntax tree when hovering over the code.</span>
		<span>ensure spans beneath other spans are rendered on top.</span>
		<span>render diagnostics that extend across multiple lines.</span>
		<span>add clipboard functionality for copying and pasting code.</span>
	</div>
	<div class="seperator"></div>
	<div id="space" class="space highlight" tabindex="-1">
		{#if showCursor}
			<Cursor {line} {column} showTooltip={showTree}>
				<Tree node={tree.root}></Tree>
			</Cursor>
		{/if}
		{#if diagnostics.length}
			{#each diagnostics as d}
				<Diagnostic line={d.span.from.line} column={d.span.from.column} length={d.span.length} message={d.message}></Diagnostic>
			{/each}
		{/if}
		{#each lines as line, i}
			<span id={`line-${i + 1}`} class="line">
				{#each line.getTokens() as token, j}
					{#if token.span.length}
						<span class="token {token.class}">
							{token.span.text}
						</span>
					{:else}
						<span class="token {token.class}">&nbsp;</span>
					{/if}
				{/each}
			</span>
		{/each}
	</div>
	<div class="seperator stats">
		<div>line {line} column {column}</div>
		<div class="value">{diagnostics.length ? '' : 'value: ' + value}</div>
	</div>
	{#if diagnostics.length}
		<div class="highlight">
			{#each diagnostics as diagnostic}
				<div class="diagnostic">
					{diagnostic.message}
					<div class="address">{diagnostic.span.address}</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style scoped lang="scss">
	.highlight {
		padding: 10px 20px;
		background-color: #f5f5f5;
		border-radius: 2px;
	}
	.seperator {
		margin-block: 20px;
	}
	.editor {
		display: flex;
		margin: auto;
		flex-direction: column;
		width: fit-content;
		min-width: 700px;
		font-family: SuisseIntl-Regular, Helvetica, Arial, sans-serif;
		font-size: 14px;
		margin-top: 5%;
	}
	.space {
		width: auto;
		padding-right: 10px;
		outline: none;
	}
	.line {
		position: relative;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		pointer-events: none;
	}
	.token {
		display: inline-block;
		width: auto;
		height: fit-content;
		min-width: 1px;
		white-space: pre;
	}
	.diagnostic {
		display: flex;
		flex-direction: row;
		.address {
			margin-left: auto;
		}
	}
	.todo {
		display: flex;
		flex-direction: column;
	}
	.number-token,
	.identifier-token {
		color: #4271ae;
		color: #718c00;
		color: #4c3dc4;
	}
	.space .comment-trivia {
		color: #c82829;
		color: #8959a8;
		color: #8e908c;
	}
	.value {
		margin-left: auto;
	}
	.stats {
		display: flex;
		flex-direction: row;
	}
</style>
