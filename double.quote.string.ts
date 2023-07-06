import { Quote } from "./quote.ts";
import { String } from "./string.ts";

export class DoubleQuoteString {
    constructor(public being: Quote, public string: String, public end: Quote) {}
}
