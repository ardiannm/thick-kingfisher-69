import { Quote } from "./quote.ts";
import { String } from "./string.ts";

export class DoubleQuoteString {
    public begin = new Quote("\"")
    public string = new String("")
    public end = new Quote("\"")
    constructor(string: String) {
        this.string = string
    }
}
