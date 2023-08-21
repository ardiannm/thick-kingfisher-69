import Token from "./Token";

export default class Character extends Token {
  constructor(public id: number, public view: string) {
    super(id);
  }
}
