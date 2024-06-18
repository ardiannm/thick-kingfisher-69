import { SourceText } from "../input/source.text";
import { Parser } from "../parser";

export class SyntaxTree {
  constructor(public text: SourceText) {}

  static from(text: string) {
    return new SyntaxTree(new SourceText(text));
  }

  parse() {
    const parser = new Parser(this);
    console.log(parser.parse());
  }
}
