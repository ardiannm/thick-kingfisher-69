import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../SourceText/SourceText";
import { Binder } from "../Binder/Binder";
import { BoundNode } from "../Binder/BoundNode";
import { BoundProgram } from "../Binder/BoundProgram";
import { BoundScope } from "../Binder/BoundScope";
import { Rewriter } from "../Rewriter/Rewriter";

export class SyntaxTree {
  private constructor(public Root: BoundNode) {}

  static *Lex(Text: string) {
    const Tokenizer = new Lexer(SourceText.From(Text));
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      switch (Token.Kind) {
        case SyntaxKind.NewLineToken:
        case SyntaxKind.SpaceToken:
        case SyntaxKind.CommentToken:
          continue;
      }
      yield Token;
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).Parse();
  }

  static Bind(Text: string) {
    return new Binder().Bind(SyntaxTree.Rewrite(Text)) as BoundProgram;
  }

  static Rewrite(Text: string) {
    return new Rewriter().Rewrite(SyntaxTree.Parse(Text));
  }
}
