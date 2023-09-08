import SyntaxToken from "./SyntaxToken";

export default class Character extends SyntaxToken {
  constructor(public view: string) {
    super();
  }
}
