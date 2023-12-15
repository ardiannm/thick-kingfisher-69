import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../SourceText/SourceText";
import { Binder } from "../Binding/Binder";
import { BoundNode } from "../Binding/BoundNode";
import { BoundProgram } from "../Binding/BoundProgram";
import { BoundScope } from "../Binding/BoundScope";

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

  static Bind(Text: string, Scope: BoundScope) {
    const Source = SourceText.From(Text);
    const Tree = new Parser(Source).Parse();
    return new Binder(Scope).Bind(Tree) as BoundProgram;
  }
}
