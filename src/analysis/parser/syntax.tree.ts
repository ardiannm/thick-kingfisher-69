import { SourceText } from "../input/source.text";
import { TextSpan } from "../input/text.span";
import { Parser } from "../parser";
import { Program } from "./program";

export class SyntaxTree {
  constructor(public text: SourceText) {}

  static from(text: string) {
    return new SyntaxTree(new SourceText(text));
  }

  parse(): Program {
    const program = new Parser(this).parse();
    return program;
  }

  textFrom(span: TextSpan) {
    return this.text.text.substring(span.start, span.end);
  }
}
