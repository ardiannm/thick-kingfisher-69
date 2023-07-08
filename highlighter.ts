import { Parser } from "./parser.ts";
import { Particle } from "./particle.ts";
import { Token } from "./token.ts";

import { html as prettify } from "https://cdn.skypack.dev/js-beautify";

export class Span {
  constructor(public scope: string, public text: Array<string | Span> = []) {}

  toString(): string {
    let text = `<span class="${this.scope}">${this.text
      .map((t) => {
        if (t instanceof Span) return t.toString();
        return t;
      })
      .join("")}</span>`.replace(/(><)/g, ">\n<");

    const directory = "__tests__/index.html";
    text = prettify(text, { indent_size: 2, indent_with_tabs: false });
    Deno.writeFileSync(directory, new TextEncoder().encode(text));
    return text;
  }
}

export class Highlighter extends Parser {
  private token: Token;
  constructor(public input: string) {
    super(input);
    this.token = this.parseAddition();
  }

  toString() {
    const span = this.toSpan(this.token);
    return span.toString();
  }

  private toSpan(token: Token): Span {
    const scope = token.token.replace(/\./g, "-");
    if (token instanceof Particle) return new Span(scope, [token.value]);
    return new Span(
      scope,
      Object.entries(token)
        .filter(([_, v]) => v instanceof Token)
        .map(([_, v]) => this.toSpan(v))
    );
  }
}
