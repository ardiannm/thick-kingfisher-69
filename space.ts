import Token from "./token.ts";

export default class Space extends Token {
  constructor(public ___: string, public from: number, public to: number) {
    super(from, to);
  }
}
