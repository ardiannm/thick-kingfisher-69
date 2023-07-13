import { Primitive } from "./primitive.ts";

export class EOF extends Primitive {
  constructor(public override value = "") {
    super(value);
  }
}
