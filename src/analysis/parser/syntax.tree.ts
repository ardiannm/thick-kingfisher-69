import { SourceText } from "../input/source.text";
import { TextSpan } from "../input/text.span";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";

export class SyntaxTree {
  private sourceText: SourceText;

  constructor(text: string) {
    this.sourceText = SourceText.from(text);
  }

  static from(text: string) {
    return new SyntaxTree(text);
  }

  parse(): CompilationUnit {
    const parser = new Parser(this);
    const compilation = parser.parse();
    console.log(compilation);
    return compilation;
  }

  getText(span: TextSpan) {
    return this.sourceText.text.substring(span.start, span.end);
  }

  getTextAt(position: number) {
    return this.sourceText.text.charAt(position);
  }
}
