import { Expression } from "./expression.ts";

export class Primitive extends Expression {
  constructor(public value: string) {
    super();
  }
}
