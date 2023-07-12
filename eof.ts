import { Primitive } from "./primitive.ts";

export class EOF extends Primitive {
  constructor(public value = "") {
    super(value);
  }
}
