import { SourceText } from "../input/source.text";
import { TextSpan } from "../input/text.span";
import { Parser } from "../parser";
import { CompilationUnit } from "./compilation.unit";

export class SyntaxTree {
  constructor(private text: SourceText) {}

  static from(text: string) {
    return new SyntaxTree(new SourceText(text));
  }

  parse(): CompilationUnit {
    const parser = new Parser(this);
    const compilation = parser.parse();
    console.log(compilation);
    return compilation;
  }

  textFrom(span: TextSpan) {
    return this.text.text.substring(span.start, span.end);
  }

  textAt(position: number) {
    return this.text.text.charAt(position);
  }
}
