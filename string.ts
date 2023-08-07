import Value from "./value.ts";

export default class String extends Value {
  constructor(public source: string, public from: number, public to: number) {
    super(source, from, to);
  }
}
