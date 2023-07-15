import { Token } from "./token.ts";

export class Primitive extends Token {
  constructor(public literal: string) {
    super();
  }
}
