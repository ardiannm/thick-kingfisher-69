<script lang="ts">
	import Cursor from './Cursor.svelte'
	import Squigglie from './Squigglie.svelte'

	import { focus } from '$lib/actions'
	import { onMount } from 'svelte'
	import { SyntaxTree } from '../../../..'
	import { EditorState, Action, EditorService } from '$lib/services'

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

	// svelte-ignore state_referenced_locally
	let prevColumn = column

	const handleKeyboard = async (event: KeyboardEvent) => {
		const input = event.key
		if (input === 'c' && event.ctrlKey) {
			event.preventDefault()
			EditorService.copyToClipboard(currentLine.span.text)
		} else if (input === 'v' && event.ctrlKey) {
			event.preventDefault()
			const content = (await EditorService.pasteFromClipboard()) + '\n'
			cursor = currentLine.fullSpan.end
			insertText(content, cursor, true)
			// FIXME: Address the issue with cursor failing to move forward as expected when on the last line
			cursor = tree.source.getPosition(line - 1, prevColumn)
		} else if (input === 'Tab') {
			insertText('\t', cursor, true)
			event.preventDefault()
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			event.preventDefault()
			moveToNextToken()
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
			event.preventDefault()
			moveToPrevToken()
		} else if (input === 'ArrowUp' && event.shiftKey && event.altKey) {
			event.preventDefault()
			duplicateLine('Up')
		} else if (input === 'ArrowDown' && event.shiftKey && event.altKey) {
			event.preventDefault()
			duplicateLine('Down')
		} else if (input === 'ArrowDown' && event.altKey) {
			event.preventDefault()
			moveLine(1)
		} else if (input === 'ArrowUp' && event.altKey) {
			event.preventDefault()
			moveLine(-1)
		} else if (input === 'x' && event.ctrlKey) {
			event.preventDefault()
			deleteLine()
		} else if (input === 'z' && event.ctrlKey) {
			event.preventDefault()
			if (stages.length > 1) {
				const stage = stages.pop()!
				prevStages.push(stage)
				switch (stage.action) {
					case Action.EDIT:
						deleteText(stage.start, stage.text.length, false)
						cursor = stage.position
						return
					case Action.DELETE:
						insertText(stage.text, stage.start, false)
						cursor = stage.position
						return
				}
			}
		} else if (input === 'y' && event.ctrlKey) {
			// FIXME: Ensure that redo actions are done properly even when new additions are made while in the middle of undo actions
			event.preventDefault()
			if (prevStages.length > 0) {
				const stage = prevStages.pop()!
				stages.push(stage)
				switch (stage.action) {
					case Action.DELETE:
						deleteText(stage.start, stage.text.length, false)
						return
					case Action.EDIT:
						insertText(stage.text, stage.start, false)
						cursor = stage.position + stage.text.length
						return
				}
			}
		} else if (input === 'ArrowRight') {
			event.preventDefault()
			moveCursorX(1)
		} else if (input === 'ArrowLeft') {
			event.preventDefault()
			moveCursorX(-1)
		} else if (input === 'ArrowDown') {
			event.preventDefault()
			moveCursorY(1)
		} else if (input === 'ArrowUp') {
			event.preventDefault()
			moveCursorY(-1)
		} else if (input === 'Enter') {
			event.preventDefault()
			insertText('\n', cursor, true)
		} else if (input === 'Backspace') {
			event.preventDefault()
			backspace()
		} else if (input === 'Delete') {
			event.preventDefault()
			deleteText(cursor, 1, true)
		} else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
			event.preventDefault()
			insertText(input, cursor, true)
		}
	}

	let prevStages = $state<EditorState[]>([])
	// svelte-ignore state_referenced_locally
	let stages = $state<EditorState[]>([new EditorState(Action.DEFAULT, 0, text, cursor)])

	const backspace = () => deleteText(cursor - 1, 1, true)

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

	const insertText = (newText: string, position: number, registerState: boolean) => {
		if (registerState) {
			if (prevStages.length) prevStages.length = 0
			const action = new EditorState(Action.EDIT, position, newText, cursor)
			stages.push(action)
		}
		text = text.substring(0, position) + newText + text.substring(position)
		cursor += newText.length
	}

	const deleteText = (position: number, steps: number, registerState: boolean) => {
		let originalPosition = cursor
		if (position < 0) position = 0
		cursor = position
		if (registerState) {
			if (prevStages.length) prevStages.length = 0
			const deletedText = text.substring(cursor, cursor + steps)
			const action = new EditorState(Action.DELETE, position, deletedText, originalPosition)
			stages.push(action)
		}
		text = text.substring(0, cursor) + text.substring(cursor + steps)
	}

	const duplicateLine = (direction: 'Up' | 'Down') => {
		const ln = tree.source.getLine(cursor)
		const lineText = text.substring(ln.span.start, ln.span.end)
		switch (direction) {
			case 'Up':
				insertText(lineText + '\n', ln.span.start, true)
				cursor = tree.source.getPosition(ln.number, prevColumn)
				return
			case 'Down':
				insertText('\n' + lineText, ln.span.end, true)
				return
		}
	}

	// FIXME: There is a bug with cursor positioning being out of index bounds when on undo and redo actions
	const deleteLine = () => {
		throw new Error('Method not implemented.')
	}

	// FIXME: Refactor this method to use insertText property which allows for proper EditorState actions
	const moveLine = (step: number) => {
		const nextLine = line + step
		const nextTree = tree.source.swapLines(line, nextLine)
		if (!nextTree) return
		text = nextTree
		cursor = tree.source.getPosition(nextLine, prevColumn)
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
		<!-- FIXME: Squigglie fails to render when in multiple lines -->
		<Squigglie start={diagnostic.span.start} end={diagnostic.span.end} text={diagnostic.message}></Squigglie>
	{/each}

	<!-- <br />
	<br />
	<br />

	{#each stages as a}
		<div>{JSON.stringify(a)}</div>
	{/each} -->
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
