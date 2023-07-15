import { Primitive } from "./primitive.ts";

export class Void extends Primitive {
  constructor(public literal = "") {
    super(literal);
  }
}
