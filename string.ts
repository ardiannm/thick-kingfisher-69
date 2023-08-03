import Quote from "./quote.ts";
import Value from "./value.ts";

export default class String extends Value {
  constructor(public begin: Quote, public source: string, public end: Quote) {
    super(source);
  }
}
