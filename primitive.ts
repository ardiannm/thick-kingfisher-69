import { Token } from "./token.ts";

export class Primitive extends Token {
  public value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
}
