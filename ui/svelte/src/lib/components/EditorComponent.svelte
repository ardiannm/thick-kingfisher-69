<script lang="ts">
	import { onMount } from 'svelte';
	import { getPosition } from '../Position';
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

	let x = $state(0);
	let y = $state(0);

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

	function updatePosition() {
		const pos = getPosition(line, column);
		x = pos.x;
		y = pos.y;
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

	$effect(updatePosition);

	onMount(() => (renderCursor = true));
</script>

<div class="editor">
	<div class="todos">
		<div>frontend</div>
		<br />
		<div class="todo">
			<span class="check"> </span> add selection capability.
		</div>
		<div class="todo">
			<span class="check"> </span> render multiline diagnostic highlighters.
		</div>
		<div class="todo">
			<span class="check"> </span> copy and paste text from the clipboard.
		</div>
		<div class="todo">
			<span class="check"> </span> add line numbers.
		</div>
		<div class="todo">
			<span class="check"> </span> blinking cursor animation.
		</div>
	</div>
	<br />
	<br />
	<div
		class="space highlight"
		onfocus={() => (renderCursor = true)}
		onblur={() => (renderCursor = false)}
		tabindex="-1"
	>
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
			<CursorComponent {x} {y} />
		{/if}
	</div>
	<br />
	<div class="stats">
		line {line} column {column}
	</div>
	{#if diagnostics.length}
		<div class="diagnostics highlight">
			{#each diagnostics as { message, span: { line, column, length, address }}}
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
<svelte:window on:keydown={handleKey} on:resize={updatePosition} on:scroll={updatePosition} />
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
		cursor: default;
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
	.tokens .space-trivia {
		background-color: #a7d8ff;
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
</style>
