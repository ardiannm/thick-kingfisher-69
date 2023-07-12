import { Parser } from "./parser.ts";
import { Primitive } from "./primitive.ts";
import { Highlight } from "./highlight.ts";
import { Token } from "./token.ts";

export class Highlighter extends Parser {
  constructor(public override input: string) {
    super(input);
  }

  generate() {
    return this.do(this.parseAddition());
  }

  private do(obj: Token, _origin = "", _prop = ""): Highlight {
    if (obj instanceof Primitive) return new Highlight(`${_prop} ${obj.token}`, obj.value);
    const subTokens = Object.entries(obj).filter(([_prop, o]) => o instanceof Token);
    return new Highlight(
      obj.token,
      subTokens.map(([_prop, o]) => this.do(o, obj.token, _prop))
    );
  }
}
