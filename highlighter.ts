import { Particle } from "./particle.ts";
import { Token } from "./token.ts";

export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}
}

export class Highlighter {
  generate(token: Token, sourceScope = ""): Span {
    if (token instanceof Particle) return new Span(`${sourceScope}.${token.token}`.replace(/^\./, ""), [token.value]);
    return new Span(
      token.token,
      Object.entries(token)
        .filter(([_, v]) => v instanceof Token)
        .map(([k, v]) => this.generate(v, k))
    );
  }
}
