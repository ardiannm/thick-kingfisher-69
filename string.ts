import Literal from "./literal.ts";

export default class String extends Literal {
  constructor(public raw: string, public from: number, public to: number) {
    super(raw, from, to);
  }
}
