<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';

	import { SourceText } from '../../../../parser/ng';
	import { onMount } from 'svelte';
	import { getPosition } from './Position';
	import DiagnosticComponent from './DiagnosticComponent.svelte';

	const code = `A1 :: A4
A5 :: 2    
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+       A5
A3 :: 1

`;

	let text = $state(code);
	const tree = $derived(SourceText.parse(text));
	const lines = $derived(tree.getLines());
	const diagnostics = $derived(tree.diagnosticsBag.diagnostics);

	let renderCursor = $state(false);
	// svelte-ignore state_referenced_locally
	let cursor = $state(text.length);
	let line = $derived(tree.getLine(cursor));
	let column = $derived(tree.getColumn(cursor));
	let x = $state(0);
	let y = $state(0);
	// svelte-ignore state_referenced_locally
	let prevColumn = column;

	function handleKey(event: KeyboardEvent) {
		renderCursor = true;
		const input = event.key;
		if (input === 'x' && event.ctrlKey) {
			removeLine();
		} else if (input === 'ArrowRight') {
			event.preventDefault();
			tranformCaretX();
		} else if (input === 'ArrowLeft') {
			event.preventDefault();
			tranformCaretX(-1);
		} else if (input === 'ArrowDown') {
			event.preventDefault();
			tranformCaretY();
		} else if (input === 'ArrowUp') {
			event.preventDefault();
			tranformCaretY(-1);
		} else if (input === 'Enter') {
			event.preventDefault();
			insertText();
		} else if (input === 'Backspace') {
			event.preventDefault();
			removeText();
			tranformCaretX(-1);
		} else if (input === 'Delete') {
			event.preventDefault();
			tranformCaretX();
			removeText();
			tranformCaretX(-1);
		} else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
			event.preventDefault();
			insertText(input);
		}
	}

	function updatePosition() {
		const pos = getPosition(line, column);
		x = pos.x;
		y = pos.y;
	}

	function tranformCaretX(step = 1) {
		const newPos = cursor + step;
		if (newPos >= 0 && newPos <= text.length) {
			cursor = newPos;
			prevColumn = column;
		}
	}

	function tranformCaretY(steps = 1) {
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
		const lines = tree.getLines()
		if (line === lines.length) {
			const span = lines[line - 2].fullSpan
			cursor = span.start
		}
		const span = lines[line - 1].fullSpan;
		text = text.slice(0, span.start) + text.slice(span.end);
	}

	$effect(updatePosition);
	onMount(() => (renderCursor = true));
</script>

<div class="editor">
	<div class="todos">
		<div>todo</div>

		<br />

		<div class="todo">
			<span class="check"> ● </span> update position on window resize.
		</div>
		<div class="todo">
			<span class="check"> ● </span> render diagnostic spans on top of the text.
		</div>
		<div class="todo">
			<span class="check"> ● </span> fix the issue with rendering spaces.
		</div>
		<div class="todo">
			<span class="check"> ● </span> edit text on keyboard event.
		</div>
		<div class="todo">
			<span class="check"> ● </span> fix the issue with not rendering bad character diagnostics.
		</div>
		<div class="todo">
			<span class="check"> ● </span> fix the issue with not rendering zero length tokens.
		</div>
		<div class="todo">
			<span class="check"> ● </span> render cursor on focus and remove on blur.
		</div>
		<div class="todo">
			<span class="check"> </span> diagnostic tooltips.
		</div>
		<div class="todo">
			<span class="check"> ● </span> remove line on ctrl + x.
		</div>
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
			{#each diagnostics as { message, span }}
				<div class="diagnostic">
					<span class="address">{span.address}</span>
					{message}
				</div>
			{/each}
		</div>
	{/if}

	{#each diagnostics as { span: { line, column, length } }}
		<DiagnosticComponent {line} {column} {length} />
	{/each}

	<br />
	<br />

	<div>tokens</div>

	<br />

	<div class="tokens highlight">
		{#each tree.getTokens() as token, i}
			<span class="token token-{(i % 4) + 1} {token.class}">{token.span.text}</span>
		{/each}
	</div>
</div>

<svelte:window on:keydown={handleKey} on:resize={updatePosition} on:scroll={updatePosition} />

<style scoped lang="scss">
	.highlight {
		background-color: #f7f7f8;
		outline: 1px solid #d9d9e3;
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
	}
	.space {
		width: 700px;
	}
	.line {
		display: block;
		flex-direction: row;
		box-sizing: border-box;
	}
	.tokens .space-trivia {
		background-color: #ccbfee;
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
		margin: 6px;
	}
</style>
