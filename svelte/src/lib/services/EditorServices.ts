export enum State {
	EDIT,
	DELETE
}

export class EditorState {
	constructor(
		public type: State,
		public start: number,
		public text: string
	) {}
}
