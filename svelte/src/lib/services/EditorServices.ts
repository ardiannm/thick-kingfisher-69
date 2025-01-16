export enum Action {
	genesisState,
	insertText,
	deleteText,
	moveLineDown
}

export class EditorState {
	constructor(
		public action: Action,
		public start: number,
		public text: string,
		// cursor position before action
		public position: number
	) {}
}

export class EditorService {
	constructor() {}

	static copyToClipboard = (text: string) => {
		;(async () => {
			try {
				await navigator.clipboard.writeText(text)
			} catch (error) {
				console.error('Failed to copy text: ', error)
			}
		})()
	}

	static pasteFromClipboard = () => {
		return (async () => {
			try {
				const text = await navigator.clipboard.readText()
				return text
			} catch (error) {
				console.error('Failed to paste text: ', error)
			}
		})()
	}
}
