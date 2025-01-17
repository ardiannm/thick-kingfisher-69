<script lang="ts">
	import Cursor from './Cursor.svelte'
	import Squigglie from './Squigglie.svelte'

	import { focus } from '$lib/actions'
	import { onMount } from 'svelte'
	import { SyntaxKind, SyntaxToken, SyntaxTree } from '../../../..'
	import { Action, ActionType, EditorService } from '$lib/services'

	let { text, style = '', startTyping = false }: { text: string; style?: string; startTyping?: boolean } = $props()

	const tree = $derived(SyntaxTree.createFrom(text))
	const lines = $derived(tree.source.getLines())
	const diagnostics = $derived(tree.source.diagnostics.bag)

	// svelte-ignore state_referenced_locally
	let cursor = $state(text.length)
	let currentLine = $derived(tree.source.getLine(cursor))
	let line = $derived(currentLine.number)
	let column = $derived(tree.source.getColumn(cursor))

	// svelte-ignore state_referenced_locally
	let prevColumn = column

	// TODO: implement a general keyboard shortcut use:action to emit keyboard hotkeys or any other events
	const handleKeyboard = async (event: KeyboardEvent) => {
		const input = event.key
		if (input === 'c' && event.ctrlKey) {
			// TODO: differentiate internal copy events from external ones when copy pasting the line or text content
			copyFromClipboard()
		} else if (input === 'v' && event.ctrlKey) {
			await pasteFromClipboard()
		} else if (input === 'ArrowRight' && event.ctrlKey) {
			moveOneTokenRight()
		} else if (input === 'ArrowLeft' && event.ctrlKey) {
			moveOneTokenLeft()
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
			deleteTokenLeft()
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

	// svelte-ignore state_referenced_locally
	let actions = $state<Action[]>([new Action(ActionType.genesisState, 0, text, cursor)])
	let prevActions = $state<Action[]>([])

	const undoAction = () => {
		if (actions.length > 1) {
			const action = actions.pop()!
			prevActions.push(action)
			switch (action.type) {
				case ActionType.insertText:
					deleteText(action.pointer, action.text.length, false)
					cursor = action.initialCursorPosition
					return
				case ActionType.deleteText:
					insertText(action.text, action.pointer, false)
					cursor = action.initialCursorPosition
					return
				case ActionType.moveLineUp:
				case ActionType.moveLineDown:
					cursor = action.pointer
					moveLineDown(false)
					cursor = action.initialCursorPosition
					return
			}
		}
	}

	const redoAction = () => {
		if (prevActions.length > 0) {
			const action = prevActions.pop()!
			actions.push(action)
			switch (action.type) {
				case ActionType.deleteText:
					deleteText(action.pointer, action.text.length, false)
					return
				case ActionType.insertText:
					insertText(action.text, action.pointer, false)
					cursor = action.initialCursorPosition + action.text.length
					return
			}
		}
	}

	const insertText = (newText: string, position: number, registerState: boolean) => {
		if (registerState) {
			if (prevActions.length) prevActions.length = 0
			// TODO: implement debouncing to group consecutive changes and minimize excessive state updates
			const action = new Action(ActionType.insertText, position, newText, cursor)
			actions.push(action)
		}
		text = text.substring(0, position) + newText + text.substring(position)
		cursor += newText.length
	}

	const deleteText = (position: number, length: number, registerState: boolean) => {
		let originalPosition = cursor
		if (position < 0) position = 0
		cursor = position
		if (registerState) {
			if (prevActions.length) prevActions.length = 0
			const deletedText = text.substring(cursor, cursor + length)
			// TODO: implement debouncing to group consecutive changes and minimize excessive state updates
			const action = new Action(ActionType.deleteText, position, deletedText, originalPosition)
			actions.push(action)
		}
		text = text.substring(0, cursor) + text.substring(cursor + length)
	}

	const backspace = () => {
		deleteText(cursor - 1, 1, true)
	}

	const deleteTokenLeft = () => {
		if (cursor <= 0) return
		if (currentLine.span.length === 0) {
			backspace()
		} else {
			let position = tree.source.getTokenPosition(cursor)
			const tokens = tree.source.tokens
			let token = tokens[position]
			while ((token.isTrivia() || token.kind === SyntaxKind.EndOfFileToken) && position > 0) {
				position--
				token = tokens[position]
			}
			const start = Math.max(token.span.start, currentLine.span.start)
			deleteText(start, cursor - start, true)
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
		if (registerState) actions.push(new Action(ActionType.moveLineUp, firstLine.span.start, editedText, atPosition))
	}

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
		if (registerState) actions.push(new Action(ActionType.moveLineDown, firstLine.span.start, editedText, atPosition))
	}

	const deleteLine = () => {
		if (currentLine.fullSpan.length) {
			deleteText(currentLine.fullSpan.start, currentLine.fullSpan.length, true)
		} else {
			backspace()
		}
	}

	const duplicateLineAbove = () => {
		const lineNext = line
		const columnNext = column
		insertText(currentLine.fullSpan.text, currentLine.span.start, true)
		cursor = tree.source.getPosition(lineNext, columnNext)
	}

	const duplicateLineBelow = () => {
		insertText(currentLine.fullSpan.text, currentLine.fullSpan.end, true)
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

	// TODO: refactor this function to reflect the deleteTokenLeft cursor behaviour
	const moveOneTokenLeft = () => {
		if (cursor <= 0) return
		const lineStart = currentLine.span.start
		if (lineStart === cursor) {
			cursor--
		} else {
			let position = tree.source.getTokenPosition(cursor - 1)
			const tokens = tree.source.tokens
			let token = tokens[position]
			while (token.isTrivia() && position > 0) {
				position--
				token = tokens[position]
			}
			cursor = Math.max(token.span.start, lineStart)
		}
	}

	// TODO: refactor this function to do exactly the reverse of what moveOneTokenLeft does
	const moveOneTokenRight = () => {}

	const copyFromClipboard = () => {
		EditorService.copyToClipboard(currentLine.span.text)
	}

	const pasteFromClipboard = async () => {
		const content = await EditorService.readFromClipboard()
		if (content) insertText(content, cursor, true)
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
				<!-- TODO: refactor this template to avoid adding unnecessary HTML span elements for tokens without styling -->
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
	<!-- TODO: Remove this template after it has served its purpose in development -->
	<!-- <br /> -->
	<!-- <br /> -->
	<!-- <br /> -->
	<!-- <div style="display: flex; flex-direction: column">
		{#each actions as stage}
			<span>{JSON.stringify(stage)}</span>
		{/each}
	</div>
	<br />
	{line}:{column}:{cursor} -->
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
