<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';
	import DiagnosticComponent from './DiagnosticComponent.svelte';
	import TooltipComponent from './TooltipComponent.svelte';
	import TreeComponent from './TreeComponent.svelte';
	import { onMount } from 'svelte';
	import { SyntaxTree } from '../../../../../';

	let { text } = $props();

	const tree = $derived(SyntaxTree.createFrom(text));

	const lines = $derived(tree.source.getLines());
	const diagnostics = $derived(tree.source.diagnosticsBag.diagnostics);

	let cursor = $state(text.length);
	let line = $derived(tree.source.getLine(cursor).number);
	let column = $derived(tree.source.getColumn(cursor));
	let currentLine = $derived(tree.source.getLines()[line - 1]);
	let tokens = $derived(tree.source.getTokens());

	let showCursor = $state(false);
	let showTree = $state(true);

	// svelte-ignore state_referenced_locally
	let prevColumn = column;

	function handleKey(event: KeyboardEvent) {
		showCursor = true;
		const input = event.key;
		if (event.code == 'AltRight' && event.altKey) {
			event.preventDefault();
			showTree = !showTree;
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			moveToNextToken();
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
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
	<div class="highlight">
		<ul>
			<li>display the syntax tree when hovering over the code.</li>
			<li>ensure spans beneath other spans are rendered on top.</li>
			<li>render diagnostics that extend across multiple lines.</li>
			<li>add clipboard functionality for copying and pasting code.</li>
		</ul>
	</div>
	<div class="seperator"></div>
	<div id="space" class="space highlight" tabindex="-1">
		{#if showCursor}
			<TooltipComponent show={showTree}>
				<CursorComponent {line} {column} />
				{#snippet message()}
					<TreeComponent node={tree.root}></TreeComponent>
				{/snippet}
			</TooltipComponent>
		{/if}
		{#if diagnostics.length}
			{#each diagnostics as diagnostic}
				<DiagnosticComponent {diagnostic} />
			{/each}
		{/if}
		{#each lines as line, i}
			<span id={`line-${i + 1}`} class="line">
				{#each line.getTokens() as token, j}
					{#if token.span.length}
						<span class="token token-{(j % 4) + 1} {token.class}">
							{token.span.text}
						</span>
					{:else}
						<span class="token token-{(j % 4) + 1} {token.class}">&nbsp;</span>
					{/if}
				{/each}
			</span>
		{/each}
	</div>
	<div class="seperator">line {line} column {column}</div>
	{#if diagnostics.length}
		<div class="highlight diagnostics">
			{#each diagnostics as diagnostic}
				<div class="diagnostic">
					{diagnostic.message}
					<div class="address">{diagnostic.span.address}</div>
				</div>
			{/each}
		</div>
	{/if}
	{#if tokens.length > 1}
		<div class="seperator">tokens</div>
		<div class="tokens highlight">
			{#each tokens as token, i}
				<TooltipComponent>
					<span class="token token-{(i % 4) + 1} {token.class}">{token.span.text}</span>
					{#snippet message()}
						<div class="message">
							{token.span.address}-{token.class}
						</div>
					{/snippet}
				</TooltipComponent>
			{/each}
		</div>
	{/if}
</div>

<style scoped lang="scss">
	.highlight {
		outline: 1px solid #d1d9e0;
		padding: 10px 20px;
		border-radius: 6px;
		background-color: #f7f8fb;
	}
	.seperator {
		margin-block: 20px;
	}
	.editor {
		display: flex;
		margin: auto;
		flex-direction: column;
		width: fit-content;
		font-family: SuisseIntl-Regular, Helvetica, Arial, sans-serif;
		font-size: 14px;
		margin-top: 5%;
	}
	.space {
		width: 700px;
		padding-right: 10px;
	}
	.line {
		position: relative;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		z-index: 1000;
		pointer-events: none;
	}
	.tokens {
		display: flex;
		flex-direction: row;
		& .space-trivia {
			background-color: #c9c3e6dc;
		}
		.message {
			background-color: white;
			padding: 1px 7px;
			border: 1px solid;
			box-shadow:
				rgba(67, 71, 85, 0.27) 0px 0px 0.25em,
				rgba(90, 125, 188, 0.05) 0px 0.25em 1em;
		}
	}
	.token {
		display: inline-block;
		width: auto;
		height: fit-content;
		min-width: 1px;
		white-space: pre;
	}
	ul {
		margin: 0;
	}
	.diagnostics {
		color: #bebec5;
		background-color: #2a2a2a;
	}
	.diagnostic {
		display: flex;
		flex-direction: row;
		.address {
			margin-left: auto;
		}
	}
</style>
