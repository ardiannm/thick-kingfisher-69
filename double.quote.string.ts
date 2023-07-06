import { Quote } from "./quote.ts";
import { String } from "./string.ts";
import { Token } from "./token.ts";

export class DoubleQuoteString extends Token {
    constructor(public being: Quote, public string: String, public end: Quote) {
        super()
    }
}
