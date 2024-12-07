<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';
	import { SourceText } from '../../../../parser/ng';

	const code = `A1 :: A4
A5 :: A2
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+A5
A3 :: 1
`;

	const text = $state(code);
	const tree = $derived(SourceText.parse(text));
	const lines = $derived(tree.getLines());
	const diagnostics = $derived(tree.diagnosticsBag.diagnostics);

	let renderCursor = $state(true);
	let cursor = $state(0);
	let line = $derived(tree.getLine(cursor));
	let column = $derived(tree.getColumn(cursor));
	let x = $state(0);
	let y = $state(0);
	// svelte-ignore state_referenced_locally
	let prevColumn = column;

	function handleKey(event: KeyboardEvent) {
		const input = event.key;
		if (input === 'ArrowRight') {
			tranformCaretX();
		} else if (input === 'ArrowLeft') {
			tranformCaretX(-1);
		} else if (input === 'ArrowDown') {
			tranformCaretY();
		} else if (input === 'ArrowUp') {
			tranformCaretY(-1);
		}
	}

	function updatePosition() {
		const pos = getPosition(line, column);
		x = pos.x;
		y = pos.y;
		console.log(pos);
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

	interface Position {
		x: number;
		y: number;
		height: number;
	}

	function getPosition(line: number, column: number): Position {
		const lineElement = document.getElementById(`line-${line}`)!;
		console.log(lineElement);

		let charCount = 0;
		column--;
		for (const child of Array.from(lineElement.childNodes)) {
			const range = document.createRange();
			try {
				if (child.nodeType === Node.ELEMENT_NODE) {
					const span = child as HTMLElement;
					const spanText = span.textContent || '';
					const spanLength = spanText.length;
					if (charCount + spanLength >= column) {
						const offsetInSpan = column - charCount;
						range.setStart(span.firstChild!, offsetInSpan);
						range.setEnd(span.firstChild!, offsetInSpan);
						return getCursorPositionFromRange(range);
					}
					charCount += spanLength;
				} else if (child.nodeType === Node.TEXT_NODE) {
					const textNode = child as Text;
					const textLength = textNode.textContent?.length || 0;
					if (charCount + textLength >= column) {
						const offsetInText = column - charCount;
						range.setStart(textNode, offsetInText);
						range.setEnd(textNode, offsetInText);
						return getCursorPositionFromRange(range);
					}
					charCount += textLength;
				}
			} finally {
				range.detach();
			}
		}
		const lastElement = lineElement.lastElementChild as HTMLElement;
		const rect = lastElement.getBoundingClientRect();

		return { x: rect.right, y: rect.top, height: rect.height };
	}

	function getCursorPositionFromRange(range: Range): Position {
		const rect = range.getBoundingClientRect();
		return { x: rect.x, y: rect.y, height: rect.height };
	}

	$effect(() => updatePosition());
</script>

<div class="editor">
	<h2>Todo</h2>
	<ul>
		<li>update position on window resize</li>
	</ul>

	<div class="space">
		{#each lines as line, index}
			<div id={`line-${index + 1}`} class="line">
				{#each line.getTokens() as token}
					<span class={token.class}>
						{#if token.span.text}
							{token.span.text}
						{:else}
							&nbsp;
						{/if}
					</span>
				{/each}
			</div>
		{/each}
		{#if renderCursor}
			<CursorComponent {x} {y} />
		{/if}
	</div>
	<div class="stats">
		{cursor}
		<br />
		line {line} column {column}
	</div>

	<div class="diagnostics">
		{#each diagnostics as diagnostic}
			<span>{diagnostic.message}</span>
		{/each}
	</div>
</div>

<svelte:window on:keydown={handleKey} />

<style scoped>
	.editor {
		display: flex;
		margin: auto;
		margin-top: auto;
		flex-direction: column;
		width: fit-content;
		height: fit-content;
		border: 1px solid lightseagreen;
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
		min-height: 16px;
		border: 1px solid transparent;
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
		min-height: 17px;
		box-sizing: border-box;
		white-space: pre;
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
	.space {
		border: 1px solid lightseagreen;
	}
</style>
