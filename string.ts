import Value from "./value.ts";

export default class String extends Value {
  constructor(public raw: string, public from: number, public to: number) {
    super(raw, from, to);
  }
}
