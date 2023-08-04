import Quote from "./quote.ts";
import TokenInfo from "./token.info.ts";
import Value from "./value.ts";

export default class String extends Value {
  constructor(public begin: Quote, public raw: string, public end: Quote, public info: TokenInfo) {
    super(raw, info);
  }
}
