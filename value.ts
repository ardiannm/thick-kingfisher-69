import { Expression } from "./expression.ts";

export class Value extends Expression {
  constructor(public raw: string) {
    super();
  }
}
