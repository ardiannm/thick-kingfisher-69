import { Primitive } from "./primitive.ts";

export class Unknown extends Primitive {
  constructor(public value = "Unknown") {
    super(value);
  }
}
