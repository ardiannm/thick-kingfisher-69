<script lang="ts">
	import { onMount } from 'svelte';
	import { SourceText } from '../../../../../src/lexing/source.text';
	import CursorComponent from './CursorComponent.svelte';
	import DiagnosticComponent from './DiagnosticComponent.svelte';
	let { text } = $props();
	const tree = $derived(SourceText.parse(text));
	const lines = $derived(tree.getLines());
	const diagnostics = $derived(
		tree.diagnosticsBag.diagnostics
			.sort((a, b) => a.span.start - b.span.start)
			.sort((a, b) => a.span.start - b.span.start)
	);
	// svelte-ignore state_referenced_locally
	let cursor = $state(text.length);
	let line = $derived(tree.getLine(cursor));
	let column = $derived(tree.getColumn(cursor));
	let currentLine = $derived(tree.getLines()[line - 1]);
	let tokens = $derived(tree.getTokens());
	let renderCursor = $state(false);
	// svelte-ignore state_referenced_locally
	let prevColumn = column;
	function handleKey(event: KeyboardEvent) {
		renderCursor = true;
		const input = event.key;
		if (input === 'ArrowDown' && event.altKey) {
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
	onMount(() => (renderCursor = true));
</script>

<div class="editor">
	<div class="todos">
		<div>frontend tasks</div>
		<br />
		<div class="todo">implement token deletion on ctrl+backspace.</div>
		<div class="todo">transform the codebase into a flexible spreadsheet data frame.</div>
		<div class="todo">add selection functionality.</div>
		<div class="todo">implement rendering of multiline diagnostic highlighters.</div>
		<div class="todo">enable clipboard text copy and paste functionality.</div>
		<div class="todo">add line numbers to the editor.</div>
		<div class="todo">create blinking cursor animation.</div>
		<div class="todo">
			debug rendering of unexpected token found span, ensuring trivia are included.
		</div>
		<div class="todo">debug rendering of missing quote in comments.</div>
		<br />
		<br />
		<div>backend tasks</div>
		<br />
		<div class="todo">evaluate reactive assignments of cell references.</div>
		<div class="todo">rewrite lexer tokens efficiently when new characters are inserted.</div>
	</div>
	<br />
	<br />
	<div class="space highlight" tabindex="-1">
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
		{#if renderCursor}
			<CursorComponent {line} {column} />
		{/if}
	</div>
	<br />
	<div class="stats">
		line {line} column {column}
	</div>
	{#if diagnostics.length}
		<div class="diagnostics highlight">
			{#each diagnostics as { message, span: { line, column, length, address } }}
				<div class="diagnostic">
					<div class="address">{address}</div>
					<div>{message}</div>
				</div>
				<DiagnosticComponent {line} {column} {length} {message} />
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
				<span class="token token-{(i % 4) + 1} {token.class}">{token.span.text}</span>
			{/each}
		</div>
	{/if}
</div>
<svelte:window on:keydown={handleKey} />

<style scoped lang="scss">
	.highlight {
		background-color: #f6f8fa;
		outline: 1px solid #d1d9e0;
		border-radius: 7px;
		padding: 10px 20px;
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
		cursor: text;
		user-select: none;
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
	.check {
		display: flex;
		width: 17px;
		height: 17px;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
	}
	.tokens {
		width: fit-content;
		display: flex;
		flex-direction: row;
	}
	.token {
		display: inline-block;
		width: fit-content;
		height: fit-content;
		min-width: 1px;
		white-space: pre;
	}
	.address {
		width: fit-content;
		min-width: 40px;
		margin-right: 6px;
	}
	.tokens {
		& .space-trivia {
			background-color: #aec7e0;
		}
	}
</style>
