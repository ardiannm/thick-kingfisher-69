import Quote from "./quote.ts";
import Value from "./value.ts";

export default class DoubleQuoteString extends Value {
  constructor(public begin: Quote, public raw: string, public end: Quote) {
    super(raw);
  }
}
