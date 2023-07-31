import { Token } from "./token.ts";

export class Space extends Token {
  constructor(public raw: string) {
    super();
  }
}
