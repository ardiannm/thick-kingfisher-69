<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';
	import DiagnosticComponent from './DiagnosticComponent.svelte';

	import { SourceText } from '../../../../parser/ng';
	import { onMount } from 'svelte';
	import { getPosition } from './Position';

	const code = `A1 :: A4
A5 :: A2
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+A5
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

	onMount(() => {
		renderCursor = true;
	});

	$effect(() => updatePosition());
</script>

<div class="editor">
	<h2>Todo</h2>
	<div class="todo">
		<span class="checkmark"> ✔ </span> update position on window resize
	</div>
	<div class="todo">
		<span class="checkmark"> ✔ </span> render diagnostic spans on top of the text
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

	<br />
	<br />

	<div class="space">
		{#each lines as line, index}
			<div id={`line-${index + 1}`} class="line">
				{#each line.getTokens() as token}
					{#if token.span.text}
						<span class={token.class}>
							{token.span.text}
						</span>
					{:else}
						<span class={token.class}> &nbsp; </span>
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

	<div class="diagnostics">
		{#each diagnostics as diagnostic}
			<span>{diagnostic.message} {diagnostic.span.address}</span>
		{/each}
	</div>

	{#if renderCursor}
		{#each diagnostics as diagnostic}
			<DiagnosticComponent {diagnostic} />
		{/each}
	{/if}
</div>

<svelte:window on:keydown={handleKey} on:resize={updatePosition} on:scroll={updatePosition} />

<style scoped>
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
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
	}
	span {
		display: flex;
		height: fit-content;
		width: fit-content;
		box-sizing: border-box;
		padding: 0;
		margin: 0;
		min-width: 3px;
		box-sizing: border-box;
		white-space: pre;
		justify-content: center;
	}
	.end-of-file-token,
	.line-break-trivia,
	.space-trivia {
		display: inline-block;
		width: 1px;
		height: 1em;
	}
	.stats {
		margin-top: 20px;
	}
	.diagnostics {
		margin-top: 20px;
	}
	.todo {
		display: flex;
		flex-direction: row;
		margin-bottom: 1px;
	}
	.checkmark {
		display: flex;
		background-color: #7e379462;
		width: 20px;
		height: 20px;
		justify-content: center;
		align-items: center;
		margin-right: 10px;
	}
</style>
