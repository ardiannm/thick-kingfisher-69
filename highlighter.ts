import { Parser } from "./parser.ts";
import { Particle } from "./particle.ts";
import { Span } from "./span.ts";
import { Token } from "./token.ts";

export class Highlighter extends Parser {
  private token: Token;
  private flat: Array<string> = [];
  constructor(public input: string) {
    super(input);
    this.token = this.parseAddition();
  }

  toString(options = { simple: true }) {
    if (options.simple) {
      this.generateSimple(this.token);
      return this.flat.join("\n");
    }
    const span = this.generate(this.token);
    return span.toString();
  }

  private generate(token: Token): Span {
    const scope = token.token.replace(/\./g, "-");
    if (token instanceof Particle) return new Span(scope, [token.value]);
    return new Span(
      scope,
      Object.entries(token)
        .filter(([_, v]) => v instanceof Token)
        .map(([_, v]) => this.generate(v))
    );
  }

  private generateSimple(token: Token): void {
    Object.entries(token).forEach(([k, v]) => {
      if (v instanceof Particle) {
        const scope = `${token.token} ${k} ${v.token}`.replace(/\./g, "-");
        const span = `<span class="${scope}">${v.value}</span>`;
        this.flat.push(span);
      }
      if (v instanceof Token) this.generateSimple(v);
    });
  }
}
