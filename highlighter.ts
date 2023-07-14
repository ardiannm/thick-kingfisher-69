import { Parser } from "./parser.ts";
import { Highlight } from "./highlight.ts";
import { Token } from "./token.ts";
import { Primitive } from "./primitive.ts";

export class Highlighter extends Parser {
  private tokens = Array<Highlight>();

  constructor(public override input: string) {
    super(input);
  }

  generate() {
    this.do(this.parseAddition());
    return this.tokens;
  }

  private do(obj: Token, origin = ["meta"]): void {
    if (obj instanceof Primitive) this.tokens.push(new Highlight(obj.literal, [...origin, obj.type]));

    Object.entries(obj)
      .filter(([_k, v]) => v instanceof Token)
      .map(([_k, v]) => this.do(v, [...origin, obj.type, _k]));
  }
}
