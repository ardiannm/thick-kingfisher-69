import Token from "./token.ts";

export default class Character extends Token {
  constructor(public source: string, public from: number, public to: number) {
    super(from, to);
  }
}
