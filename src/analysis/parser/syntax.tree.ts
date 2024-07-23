import { SourceText } from "../text/source.text";
import { TokenSpan } from "../text/token.span";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";

export class SyntaxTree {
  public readonly text: SourceText;

  constructor(text: string) {
    this.text = SourceText.from(text);
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
