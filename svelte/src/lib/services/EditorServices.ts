export enum State {
	DEFAULT,
	EDIT,
	DELETE
}

export class EditorState {
	constructor(
		public action: State,
		public start: number,
		public text: string,
		public cursor: number
	) {}
}
