import Token from "./Token";

export default class Character extends Token {
  constructor(public gen: number, public view: string) {
    super(gen);
  }
}
