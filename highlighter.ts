import { Parser } from "./parser.ts";
import { Particle } from "./particle.ts";
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
    Object.entries(token).forEach(([_, v]) => {
      if (v instanceof Particle) this.spans.push(new Span(id, v.token, v.value));
      if (v instanceof Token) {
        this.generate(v, sha1(token.token));
      }
    });
  }
}
