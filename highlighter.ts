import { Particle } from "./particle.ts";
import { Token } from "./token.ts";

// import sha1 from "https://cdn.skypack.dev/sha1";
// const hash = (string: string) => sha1(string).substring(0, 5);

export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}

  toString(format = true): string {
    const io = `<span class="${this.scope}">${this.text
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
  generate(token: Token): Span {
    const scope = token.token;
    if (token instanceof Particle) return new Span(scope, [token.value]);
    return new Span(
      scope,
      Object.entries(token)
        .filter(([_, v]) => v instanceof Token)
        .map(([_, v]) => this.generate(v))
    );
  }
}
