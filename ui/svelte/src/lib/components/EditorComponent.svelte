<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';
	import DiagnosticComponent from './DiagnosticComponent.svelte';
	import TooltipComponent from './TooltipComponent.svelte';
	import { onMount } from 'svelte';
	import { SourceText } from '../../../../../src/lexing/source.text';

	let { text } = $props();

	const tree = $derived(SourceText.parse(text));
	const lines = $derived(tree.getLines());
	const diagnostics = $derived(
		tree.diagnosticsBag.diagnostics.sort((a, b) => a.span.start - b.span.start)
	);

	let cursor = $state(text.length);
	let line = $derived(tree.getLine(cursor));
	let column = $derived(tree.getColumn(cursor));
	let currentLine = $derived(tree.getLines()[line - 1]);
	let tokens = $derived(tree.getTokens());
	let showCursor = $state(false);

	// svelte-ignore state_referenced_locally
	let prevColumn = column;

	function handleKey(event: KeyboardEvent) {
		showCursor = true;
		const input = event.key;
		if (input === 'ArrowUp' && event.shiftKey && event.altKey) {
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
		const nextTree = tree.swapLines(line, nextLine);
		if (!nextTree) return;
		text = nextTree;
		cursor = tree.getPosition(nextLine, prevColumn);
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
			const pos = tree.getPosition(prevLine, prevColumn);
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
		text = tree.duplicateLine(line);
		const ln = line;
		cursor = tree.getPosition(ln + step, prevColumn);
	}

	onMount(() => (showCursor = true));
</script>

<svelte:window on:keydown={handleKey} />

<div class="editor">
	<div class="todos">
		<br />
		<br />
		<br />
		<br />
		<div>bugs</div>
		<br />
		<div class="todo">
			unexpected end-of-file-token diagnostic span does not include the trivia in the diagnostic
			rendering.
		</div>
		<div class="todo">rendering failure for the diagnostic missing quote on comments.</div>
		<br />
		<br />
	</div>
	<br />
	<br />
	<div id="space" class="space highlight" tabindex="-1">
		{#each lines as line, i}
			<span id={`line-${i + 1}`} class="line">
				{#each line.getTokens() as token, j}
					{#if token.span.length}
						<span class="token token-{(j % 4) + 1} {token.class}">
							{token.span.text}
						</span>
					{:else}
						<span class="token {token.class}">&nbsp;</span>
					{/if}
				{/each}
			</span>
		{/each}
		{#if showCursor}
			<CursorComponent {line} {column} />
		{/if}
		{#if diagnostics.length}
			{#each diagnostics as diagnostic}
				<DiagnosticComponent {diagnostic} />
			{/each}
		{/if}
	</div>
	<br />
	<div class="stats">
		line {line} column {column}
	</div>
	{#if diagnostics.length}
		<div class="diagnostics highlight">
			{#each diagnostics as diagnostic}
				<div class="diagnostic">
					<div class="address">{diagnostic.span.address}</div>
					<div>{diagnostic.message}</div>
				</div>
			{/each}
		</div>
	{/if}
	<br />
	<br />
	{#if tokens.length > 1}
		<div>tokens</div>
		<br />
		<div class="tokens highlight">
			{#each tokens as token, i}
				<TooltipComponent>
					<span class="token token-{(i % 4) + 1} {token.class}">{token.span.text}</span>
					{#snippet message()}
						{token.span.address}
					{/snippet}
				</TooltipComponent>
			{/each}
		</div>
	{/if}
</div>

<style scoped lang="scss">
	.highlight {
		background-color: #f6f8fa;
		outline: 1px solid #d1d9e0;
		border-radius: 7px;
		padding: 10px 20px;
		user-select: none;
	}
	.editor {
		display: flex;
		margin: auto;
		margin-top: auto;
		flex-direction: column;
		width: fit-content;
		padding: 10px;
		font-family: SuisseIntl-Regular, Helvetica, Arial, sans-serif;
		font-size: 14px;
	}
	.space {
		width: 700px;
	}
	.line {
		position: relative;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		z-index: 1;
		pointer-events: none;
	}
	.stats {
		margin-top: 20px;
	}
	.diagnostics {
		display: flex;
		flex-direction: column;
		margin-top: 20px;
	}
	.diagnostic {
		display: flex;
		flex-direction: row;
		align-items: center;
		white-space: pre;
	}
	.todos {
		padding: 7px;
	}
	.todo {
		display: flex;
		flex-direction: row;
		margin-left: 20px;
	}
	.tokens {
		display: flex;
		flex-direction: row;
		& .space-trivia,
		.line-break-trivia {
			background-color: #cbdaf5;
		}
	}
	.token {
		display: inline-block;
		width: auto;
		height: fit-content;
		min-width: 1px;
		white-space: pre;
	}
	.address {
		width: fit-content;
		min-width: 40px;
		margin-right: 6px;
	}
</style>
