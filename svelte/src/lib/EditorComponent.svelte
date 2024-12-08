<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';

	import { SourceText } from '../../../../parser/ng';
	import { onMount } from 'svelte';
	import { getPosition } from './Position';

	const code = `A1 :: A4
A5 :: A2    
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
		const input = event.key;
		if (input === 'ArrowRight') {
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

	onMount(() => {
		renderCursor = true;
	});

	$effect(() => updatePosition());
</script>

<div class="editor">
	<div class="todos">
		<h3>Todo</h3>
		<div class="todo">
			<span class="checkmark"> ● </span> update position on window resize
		</div>
		<div class="todo">
			<span class="checkmark"> ● </span> render diagnostic spans on top of the text
		</div>
		<div class="todo">
			<span class="checkmark"> ● </span> fix the issue with rendering spaces
		</div>
		<div class="todo">
			<span class="checkmark"> </span> edit text on keyboard event
		</div>
		<div class="todo">
			<span class="checkmark"> </span> add line numbers
		</div>
		<div class="todo">
			<span class="checkmark"> </span> blinking cursor animation
		</div>
	</div>

	<br />
	<br />

	<div class="space highlight">
		{#each lines as line, index}
			<div id={`line-${index + 1}`} class="line">
				{#each line.getTokens() as token}
					{#if token.span.length}
						<span class="token {token.class}">
							{token.span.text}
						</span>
					{:else}
						<span class="token {token.class}">&nbsp;</span>
					{/if}
				{/each}
			</div>
		{/each}
		{#if renderCursor}
			<CursorComponent {x} {y} />
		{/if}
	</div>
	<div class="stats">
		line {line} column {column}
	</div>

	<div class="diagnostics highlight">
		{#each diagnostics as diagnostic}
			<div>
				<span class="address">{diagnostic.span.address}</span>
				{diagnostic.message}
			</div>
		{/each}
	</div>
	<!-- 
	{#each diagnostics as diagnostic}
		<DiagnosticComponent {diagnostic} />
	{/each} -->

	<br />
	<br />
	<br />

	<h3>Tokens</h3>

	<div class="tokens">
		{#each tree.getTokens() as token}
			<span class="token {token.class}">{token.span.text}</span>
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
	.end-of-file-token,
	.line-break-trivia,
	.space-trivia {
		display: flex;
		white-space: pre;
		width: 1px;
		height: 1em;
	}
	.space-trivia {
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
	.todos {
		padding: 7px;
	}
	.todo {
		display: flex;
		flex-direction: row;
	}
	.checkmark {
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
		cursor: pointer;
	}
	.address {
		margin: 6px;
	}
</style>
