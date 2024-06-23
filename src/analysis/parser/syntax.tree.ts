import { Text } from "../input/text";
import { TokenSpan } from "../input/token.span";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";

export class SyntaxTree {
  public readonly text: Text;

  constructor(text: string) {
    this.text = Text.from(text);
  }

  static from(text: string) {
    return new SyntaxTree(text);
  }

  parse(): CompilationUnit {
    const parser = new Parser(this);
    const compilation = parser.parse();
    return compilation;
  }

  getText(span: TokenSpan) {
    return this.text.get(span.start, span.end);
  }

  getCharAt(position: number) {
    return this.text.get(position);
  }
}
