import Token from "./token.ts";

export default class Character extends Token {
  constructor(public raw: string) {
    super();
  }
}
