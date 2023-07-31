import { Token } from "./token.ts";

export class Value extends Token {
  constructor(public raw: string) {
    super();
  }
}
