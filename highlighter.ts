import { Particle } from "./particle.ts";
import { Token } from "./token.ts";

export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}

  toString(format = true): string {
    const io = `<span class="${this.scope.replaceAll(".", "__")}">${this.text
      .map((t) => {
        if (t instanceof Span) return t.toString();
        return t;
      })
      .join("")}</span>`;
    if (format) return io.replaceAll("><", ">\n<");
    return io;
  }
}

export class Highlighter {
  generate(token: Token, sourceScope = ""): Span {
    const scope = `${sourceScope} ${token.token}`.trim();
    if (token instanceof Particle) return new Span(scope, [token.value]);
    return new Span(
      scope,
      Object.entries(token)
        .filter(([_, v]) => v instanceof Token)
        .map(([k, v]) => this.generate(v, k))
    );
  }
}
