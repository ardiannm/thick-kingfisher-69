export enum ActionType {
	genesisState,
	insertText,
	deleteText,
	moveLineUp,
	moveLineDown
}

export class Action {
	constructor(
		public type: ActionType,
		public pointer: number,
		public text: string,
		public initialCursorPosition: number
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

	static readFromClipboard = () => {
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
