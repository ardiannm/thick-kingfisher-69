import { Parser } from "./parser.ts";
import { Primitive } from "./primitive.ts";
import { Span } from "./span.ts";
import { Token } from "./token.ts";

import sha1 from "https://cdn.skypack.dev/sha1";

export class Highlighter extends Parser {
  public spans: Array<Span> = [];

  constructor(public override input: string) {
    super(input);
    this.generate(this.parseAddition());
  }

  private generate(token: Token, id = ""): void {
    if (token instanceof Primitive) {
      const span = new Span(id, sha1(id), token.token, token.value);
      this.spans.push(span);
      return;
    }
    Object.entries(token).forEach(([_, v]) => {
      if (v instanceof Token) this.generate(v, sha1(id));
    });
  }
}
