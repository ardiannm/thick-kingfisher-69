import Token from "./Token";

export default class Character extends Token {
  constructor(public view: string) {
    super();
  }
}
