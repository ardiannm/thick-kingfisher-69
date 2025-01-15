<script lang="ts">
	import Cursor from './Cursor.svelte'
	import Squigglie from './Squigglie.svelte'

	import { focus } from '$lib/actions'
	import { onMount } from 'svelte'
	import { SyntaxTree } from '../../../..'

	import { Action, EditorState } from '$lib/services/EditorServices'

	let { text, style = '', startTyping = false }: { text: string; style?: string; startTyping?: boolean } = $props()

	const tree = $derived(SyntaxTree.createFrom(text))
	const lines = $derived(tree.source.getLines())
	const diagnostics = $derived(tree.source.diagnostics.bag)

	// svelte-ignore state_referenced_locally
	let cursor = $state(text.length)
	let line = $derived(tree.source.getLine(cursor).number)
	let column = $derived(tree.source.getColumn(cursor))
	let currentLine = $derived(tree.source.getLine(cursor))
	let tokens = $derived(tree.source.tokens)

	const copyToClipboard = (text: string) => {
		;(async () => {
			try {
				await navigator.clipboard.writeText(text)
			} catch (error) {
				console.error('Failed to copy text: ', error)
			}
		})()
	}

	const pasteFromClipboard = () => {
		return (async () => {
			try {
				const text = await navigator.clipboard.readText()
				return text
			} catch (error) {
				console.error('Failed to paste text: ', error)
			}
		})()
	}

	// svelte-ignore state_referenced_locally
	let prevColumn = column

	const editorState = EditorState.createState(text)

	const handleKeyboard = async (event: KeyboardEvent) => {
		const input = event.key
		if (input === 'c' && event.ctrlKey) {
			event.preventDefault()
			copyToClipboard(currentLine.span.text)
		} else if (input === 'v' && event.ctrlKey) {
			event.preventDefault()
			const content = (await pasteFromClipboard()) + '\n'
			cursor = currentLine.fullSpan.end
			insertText(content)
			// FIXME: Address the issue with cursor failing to move forward as expected when on the last line
			cursor = tree.source.getPosition(line - 1, prevColumn)
		} else if (input === 'Tab') {
			insertText('\t')
			event.preventDefault()
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			event.preventDefault()
			moveToNextToken()
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
			event.preventDefault()
			moveToPrevToken()
		} else if (input === 'ArrowUp' && event.shiftKey && event.altKey) {
			event.preventDefault()
			duplicateLine(0)
		} else if (input === 'ArrowDown' && event.shiftKey && event.altKey) {
			event.preventDefault()
			duplicateLine(+1)
		} else if (input === 'ArrowDown' && event.altKey) {
			event.preventDefault()
			moveLine(+1)
		} else if (input === 'ArrowUp' && event.altKey) {
			event.preventDefault()
			moveLine(-1)
		} else if (input === 'x' && event.ctrlKey) {
			event.preventDefault()
			deleteLine()
		} else if (input === 'z' && event.ctrlKey) {
			event.preventDefault()
			const prevState = editorState.getPrevState()
			switch (prevState.action) {
				case Action.INSERT:
					deleteText(prevState.position, prevState.text.length)
			}
		} else if (input === 'ArrowRight') {
			event.preventDefault()
			moveCursorX(+1)
		} else if (input === 'ArrowLeft') {
			event.preventDefault()
			moveCursorX(-1)
		} else if (input === 'ArrowDown') {
			event.preventDefault()
			moveCursorY(+1)
		} else if (input === 'ArrowUp') {
			event.preventDefault()
			moveCursorY(-1)
		} else if (input === 'Enter') {
			event.preventDefault()
			insertText('\n')
		} else if (input === 'Backspace') {
			event.preventDefault()
			backspace()
		} else if (input === 'Delete') {
			event.preventDefault()
			deleteText(cursor, 1)
		} else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
			event.preventDefault()
			insertText(input)
		}
	}

	const moveLine = (step: number) => {
		const nextLine = line + step
		const nextTree = tree.source.swapLines(line, nextLine)
		if (!nextTree) return
		text = nextTree
		cursor = tree.source.getPosition(nextLine, prevColumn)
	}

	const backspace = () => deleteText(cursor - 1, 1)

	const moveCursorX = (step: number) => {
		const newPos = cursor + step
		if (newPos >= 0 && newPos <= text.length) {
			cursor = newPos
			prevColumn = column
		}
	}

	const moveCursorY = (steps: number) => {
		const prevLine = line + steps
		if (prevLine > 0) {
			const pos = tree.source.getPosition(prevLine, prevColumn)
			cursor = pos
		} else {
			prevColumn = 1
			cursor = 0
		}
	}

	const insertText = (charText: string) => {
		editorState.registerInsertAction(cursor, charText)
		text = text.substring(0, cursor) + charText + text.substring(cursor)
		cursor += charText.length
	}

	const deleteText = (position: number, steps: number) => {
		cursor = position
		text = text.substring(0, position) + text.substring(position + steps)
	}

	const deleteLine = () => {
		const span = currentLine.fullSpan
		if (span.length === 0) {
			backspace()
		} else {
			text = text.slice(0, span.start) + text.slice(span.end)
			cursor = span.start
		}
	}

	const duplicateLine = (step: number) => {
		text = tree.source.duplicateLine(line)
		cursor = tree.source.getPosition(line + step, prevColumn)
	}

	const moveToPrevToken = () => {
		const position = tree.source.getPosition(line, column)
		let index = tree.source.getTokenLocation(position - 1)
		let token = tokens[index]
		while (token && token.isPunctuation()) {
			index--
			token = tokens[index]
		}
		cursor = token.span.start
	}

	const moveToNextToken = () => {
		const position = tree.source.getPosition(line, column)
		let index = tree.source.getTokenLocation(position + 1)
		let token = tokens[index]
		while (token && token.isPunctuation()) {
			index++
			token = tokens[index]
		}
		if (token) {
			cursor = token.span.end
		} else {
			cursor = text.length
		}
	}

	let isTyping = $state()

	$effect(() => {
		if (isTyping) {
			document.addEventListener('keydown', handleKeyboard)
		} else {
			document.removeEventListener('keydown', handleKeyboard)
		}
	})

	onMount(() => {
		if (startTyping)
			setTimeout(() => {
				isTyping = true
			})
	})

	const switchFocusState = (event: boolean) => {
		isTyping = event
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor" tabindex="-1" {style} use:focus={switchFocusState}>
	{#each lines as ln}
		<div class="line">
			{#each ln.getTokens() as token}
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
	{#if isTyping}
		<Cursor position={cursor} />
	{/if}
	{#each diagnostics as diagnostic}
		<Squigglie start={diagnostic.span.start} end={diagnostic.span.end} text={diagnostic.message}></Squigglie>
	{/each}
</div>

<style scoped lang="scss">
	.editor {
		outline: none;
		background-color: white;
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
		z-index: 1;
	}
	.identifier-token,
	.number-token {
		color: #215273;
	}
	.comment-trivia {
		color: #359d9e;
	}
</style>
