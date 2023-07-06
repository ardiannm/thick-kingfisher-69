import { Token } from "./token.ts";

export class Particle extends Token {
  public value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
}
