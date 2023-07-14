import { Token } from "./token.ts";

export class Primitive extends Token {
  public literal: string;
  constructor(literal: string) {
    super();
    this.literal = literal;
  }
}
