import { Parser } from "./parser.ts";
import { Particle } from "./particle.ts";
import { Span } from "./span.ts";
import { Token } from "./token.ts";

type Options = { keepStructure?: boolean; keepFields?: boolean };

export class Highlighter extends Parser {
  private token: Token;
  private spans: Array<string> = [];
  constructor(public input: string) {
    super(input);
    this.token = this.parseAddition();
  }

  toString(options: Options = { keepStructure: false, keepFields: true }) {
    if (!options.keepStructure) {
      this.generateSimple(this.token, options.keepFields);
      return this.spans.join("\n");
    }
    const span = this.generate(this.token);
    return span.toString();
  }

  private generate(token: Token): Span {
    const scope = token.token.replace(/\./g, "-");
    if (token instanceof Particle) return new Span(scope, [token.value]);
    const content = Object.entries(token)
      .filter(([_, v]) => v instanceof Token)
      .map(([_, v]) => this.generate(v));
    return new Span(scope, content);
  }

  private generateSimple(token: Token, keepFields = false): void {
    Object.entries(token).forEach(([k, v]) => {
      if (v instanceof Particle) {
        const include = keepFields ? k : "";
        const scope = `${token.token} ${include} ${v.token}`.replace(/\s+/g, " ").replace(/\./g, "-");
        const span = `<span class="${scope}">${v.value.replace(/ /g, "&nbsp;")}</span>`;
        this.spans.push(span);
      }
      if (v instanceof Token) this.generateSimple(v, keepFields);
    });
  }
}
