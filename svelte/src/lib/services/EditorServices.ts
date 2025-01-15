interface State {
	action: Action
	position: number
	text: string
}

export enum Action {
	INSERT,
	DELETE,
	NONE
}

export class SourceTextAction implements State {
	constructor(
		public action: Action,
		public position: number,
		public text: string
	) {}
}

export class EditorState {
	private stack = [] as SourceTextAction[]
	private position = 0

	constructor(text: string = '') {
		this.stack.push(new SourceTextAction(Action.NONE, 0, text))
	}

	static createState(text: string = '') {
		return new EditorState(text)
	}

	getInitState() {
		return this.stack[0]
	}

	registerInsertAction(start: number, text: string) {
		if (this.position < this.stack.length) {
			this.stack.length = this.position + 1
		}
		const action = new SourceTextAction(Action.INSERT, start, text)
		this.stack.push(action)
		this.position++
	}

	registerDeleteAction(start: number, text: string) {
		const action = new SourceTextAction(Action.DELETE, start, text)
		this.stack.push(action)
		this.position--
	}

	getPrevState() {
		const state = this.stack[this.position]
		if (this.position > 0) this.position--
		return state
	}
}
