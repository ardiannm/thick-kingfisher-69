import { Lexer } from "../Lexer";
import { Parser } from "../Parser";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../SourceText/SourceText";
import { Environment } from "../../Environment";
import { SyntaxRoot } from "./SyntaxRoot";
import { Binder } from "../Binder";

export class SyntaxTree {
  private constructor(public Root: SyntaxRoot) {}

  static *Lex(Text: string) {
    const Tokenizer = new Lexer(SourceText.From(Text));
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      yield Token;
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).Parse();
  }

  static Bind(Text: string, Environment: Environment) {
    const Source = SourceText.From(Text);
    const Tree = new Parser(Source).Parse();
    return new Binder(Environment).Bind(Tree);
  }
}
