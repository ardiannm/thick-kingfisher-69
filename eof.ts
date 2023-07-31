import { Token } from "./token.ts";

export class EOF extends Token {
  constructor(public raw?: string) {
    super();
    this.raw = this.constructor.name;
  }
}
