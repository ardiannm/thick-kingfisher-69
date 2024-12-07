<script lang="ts">
	import CursorComponent from './CursorComponent.svelte';

	import { onMount } from 'svelte';
	import { SourceText } from '../../../../parser/ng';

	const text = $state(`@Component({
})
 

export class AppComponent {}`);

	const tree = $derived(SourceText.createFrom(text));
	const lines = $derived(tree.getLines());

	let renderCursor = $state(false);
	let cursor = $state(0);
	let line = $derived(tree.getLine(cursor));
	let column = $derived(tree.getColumn(cursor));
	let x = $state(0);
	let y = $state(0);

	function handleKey(event: KeyboardEvent) {
		const input = event.key;
		if (input === 'ArrowRight') {
			tranformCaretX();
		} else if (input === 'ArrowLeft') {
			tranformCaretX(-1);
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
			updatePosition();
		}
	}

	$effect(() => {
		const token = tree.getTokens()[tree.getTokenAt(cursor)];
		console.log(token.span.text, token.kind);
	});

	interface Position {
		x: number;
		y: number;
		height: number;
	}

	function getPosition(line: number, column: number): Position {
		const lineElement = document?.getElementById(`line-${line}`)!;
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

	onMount(() => {
		renderCursor = true;
		updatePosition();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<div>
	{#each lines as line, index}
		<div id={`line-${index + 1}`} class="line">
			{#each line.getTokens() as token}
				<span class={token.class}>
					{token.span.text.replace('\n', ' ')}
				</span>
			{/each}
		</div>
	{/each}

	{#if renderCursor}
		<CursorComponent {x} {y} />
	{/if}

	{cursor}
	<br />
	line {line} column {column}
</div>

<svelte:window on:keydown={handleKey} />

<style scoped>
	.line {
		display: flex;
		flex-direction: row;
		min-height: 16px;
		border: 1px solid transparent;
		box-sizing: border-box;
		padding-left: 7px;
		border-bottom: 1px solid red;
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

	.line-break-trivia,
	.space-trivia {
		display: inline-block;
		width: 1px;
		height: 1em;
	}
</style>
