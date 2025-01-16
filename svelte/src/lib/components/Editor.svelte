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
	let currentLine = $derived(tree.source.getLine(cursor))
	let line = $derived(currentLine.number)
	let column = $derived(tree.source.getColumn(cursor))
	let tokens = $derived(tree.source.tokens)

	// svelte-ignore state_referenced_locally
	let prevColumn = column

	// TODO: implement a general keyboard shortcut use:action to emit keyboard hotkeys or any other events
	const handleKeyboard = async (event: KeyboardEvent) => {
		const input = event.key
		if (input === 'c' && event.ctrlKey) {
			// TODO: differentiate internal copy events from external ones when copy pasting the line or text content
			EditorService.copyToClipboard(currentLine.span.text)
		} else if (input === 'v' && event.ctrlKey) {
			await pasteFromClipboard()
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			moveToNextToken()
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
			moveToPrevToken()
		} else if (input === 'ArrowUp' && event.shiftKey && event.altKey) {
			duplicateLineAbove()
		} else if (input === 'ArrowDown' && event.shiftKey && event.altKey) {
			duplicateLineBelow()
		} else if (input === 'ArrowUp' && event.altKey) {
			moveLineUp(true)
		} else if (input === 'ArrowDown' && event.altKey) {
			moveLineDown(true)
		} else if (input === 'x' && event.ctrlKey) {
			deleteLine()
		} else if (input === 'z' && event.ctrlKey) {
			undoAction()
		} else if (input === 'y' && event.ctrlKey) {
			redoAction()
		} else if (input === 'Backspace' && event.ctrlKey) {
			// TODO: implement this function
			throw new Error('Function not implemented')
		} else if (input === 'ArrowRight') {
			moveCursorX(1)
		} else if (input === 'ArrowLeft') {
			moveCursorX(-1)
		} else if (input === 'ArrowUp') {
			moveCursorY(-1)
		} else if (input === 'ArrowDown') {
			moveCursorY(1)
		} else if (input === 'Enter') {
			insertText('\n', cursor, true)
		} else if (input === 'Backspace') {
			backspace()
		} else if (input === 'Delete') {
			deleteText(cursor, 1, true)
		} else if (input === 'Tab') {
			event.preventDefault()
			insertText('\t', cursor, true)
		} else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
			insertText(input, cursor, true)
		}
	}

	let prevStages = $state<EditorState[]>([])
	// svelte-ignore state_referenced_locally
	let stages = $state<EditorState[]>([new EditorState(Action.genesisState, 0, text, cursor)])

	const undoAction = () => {
		if (stages.length > 1) {
			const stage = stages.pop()!
			prevStages.push(stage)
			switch (stage.action) {
				case Action.insertText:
					deleteText(stage.pointer, stage.text.length, false)
					cursor = stage.initialCursorPosition
					return
				case Action.deleteText:
					insertText(stage.text, stage.pointer, false)
					cursor = stage.initialCursorPosition
					return
				case Action.moveLineUp:
				case Action.moveLineDown:
					cursor = stage.pointer
					moveLineDown(false)
					cursor = stage.initialCursorPosition
					return
			}
		}
	}

	const redoAction = () => {
		if (prevStages.length > 0) {
			const stage = prevStages.pop()!
			stages.push(stage)
			switch (stage.action) {
				case Action.deleteText:
					deleteText(stage.pointer, stage.text.length, false)
					return
				case Action.insertText:
					insertText(stage.text, stage.pointer, false)
					cursor = stage.initialCursorPosition + stage.text.length
					return
			}
		}
	}

	const insertText = (newText: string, position: number, registerState: boolean) => {
		if (registerState) {
			if (prevStages.length) prevStages.length = 0
			// TODO: implement debouncing to group consecutive changes and minimize excessive state updates
			const action = new EditorState(Action.insertText, position, newText, cursor)
			stages.push(action)
		}
		text = text.substring(0, position) + newText + text.substring(position)
		cursor += newText.length
	}

	const deleteText = (position: number, length: number, registerState: boolean) => {
		let originalPosition = cursor
		if (position < 0) position = 0
		cursor = position
		if (registerState) {
			if (prevStages.length) prevStages.length = 0
			const deletedText = text.substring(cursor, cursor + length)
			// TODO: implement debouncing to group consecutive changes and minimize excessive state updates
			const action = new EditorState(Action.deleteText, position, deletedText, originalPosition)
			stages.push(action)
		}
		text = text.substring(0, cursor) + text.substring(cursor + length)
	}

	const backspace = () => {
		deleteText(cursor - 1, 1, true)
	}

	const pasteFromClipboard = async () => {
		const content = await EditorService.readFromClipboard()
		content && insertText(content, cursor, true)
	}

	const duplicateLineAbove = () => {
		const lineNext = line
		const columnNext = column
		insertText(currentLine.fullSpan.text, currentLine.span.start, true)
		cursor = tree.source.getPosition(lineNext, columnNext)
	}

	// TODO: implement this function
	const duplicateLineBelow = () => {
		throw new Error('Function not implemented')
	}

	const deleteLine = () => {
		if (currentLine.fullSpan.length) {
			deleteText(currentLine.fullSpan.start, currentLine.fullSpan.length, true)
		} else {
			backspace()
		}
	}

	const moveLineUp = (registerState: boolean) => {
		if (currentLine.number === 1) {
			return
		}
		const firstLine = tree.source.getLine(currentLine.fullSpan.start - 1)
		const secondLine = currentLine
		const text1 = firstLine.span.text
		const text2 = secondLine.span.text
		const atPosition = cursor
		const editedText = text2 + '\n' + text1
		if (text1 === text2) {
			moveCursorY(-1)
		} else {
			const lineNext = line - 1
			const columnNext = column
			text = text.substring(0, firstLine.span.start) + editedText + text.substring(secondLine.span.end)
			cursor = tree.source.getPosition(lineNext, columnNext)
		}
		if (registerState) stages.push(new EditorState(Action.moveLineUp, firstLine.span.start, editedText, atPosition))
	}

	// TODO: implement this function
	const moveLineDown = (registerState: boolean) => {
		const firstLine = currentLine
		if (firstLine.fullSpan.end >= text.length) {
			return
		}
		const secondLine = tree.source.getLine(firstLine.fullSpan.end)
		const text1 = firstLine.span.text
		const text2 = secondLine.span.text
		const atPosition = cursor
		const editedText = text2 + '\n' + text1
		if (text1 === text2) {
			moveCursorY(1)
		} else {
			const lineNext = line + 1
			const columnNext = column
			text = text.substring(0, firstLine.span.start) + editedText + text.substring(secondLine.span.end)
			cursor = tree.source.getPosition(lineNext, columnNext)
		}
		if (registerState) stages.push(new EditorState(Action.moveLineDown, firstLine.span.start, editedText, atPosition))
	}

	const moveToPrevToken = () => {
		const position = tree.source.getPosition(line, column)
		let index = tree.source.getTokenPosition(position - 1)
		let token = tokens[index]
		while (token.isPunctuation()) {
			index--
			token = tokens[index]
		}
		cursor = token.span.start
	}

	const moveToNextToken = () => {
		const position = tree.source.getPosition(line, column)
		let index = tree.source.getTokenPosition(position + 1)
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

	let isTyping = $state()

	onMount(() => {
		if (startTyping)
			setTimeout(() => {
				isTyping = true
			})
	})

	$effect(() => {
		if (isTyping) {
			document.addEventListener('keydown', handleKeyboard)
		} else {
			document.removeEventListener('keydown', handleKeyboard)
		}
	})

	const switchIsTyping = (event: boolean) => {
		isTyping = event
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor" tabindex="-1" {style} use:focus={switchIsTyping}>
	{#each lines as ln}
		<div class="line">
			{#each ln.getTokens() as token}
				<!-- TODO: refactor the code to avoid adding unnecessary HTML span elements for tokens without styling -->
				{#if token.span.length}
					<span class="token {token.class}">{token.span.text}</span>
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
		<!-- FIXME: squigglie fails to render when in multiple lines -->
		<Squigglie start={diagnostic.span.start} end={diagnostic.span.end} text={diagnostic.message}></Squigglie>
	{/each}
	<br />
	<br />
	<br />
	<!-- TODO: remove this template after servig the development process purposes -->
	<div style="display: flex; flex-direction: column">
		{#each stages as stage}
			<span>{JSON.stringify(stage)}</span>
		{/each}
	</div>
	<br />
	{line}:{column}:{cursor}
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
