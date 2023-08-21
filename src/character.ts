import Token from "./token";

export default class Character extends Token {
  constructor(public id: number, public view: string) {
    super(id);
  }
}
