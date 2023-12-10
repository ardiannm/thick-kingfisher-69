import { Lexer } from "../../Lexer";
import { Parser } from "../../Parser";
import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../SourceText/SourceText";
import { Environment } from "../../Environment";
import { Binder } from "../../Binder";

// SyntaxTree class represents the abstract syntax tree (AST) of the programming language.

export class SyntaxTree extends SyntaxNode {
  // Constructor for SyntaxTree.
  constructor(public Kind: SyntaxKind, public Expressions: Array<Expression>) {
    super(Kind);
  }

  // Lexical analysis: Generates a sequence of tokens from the input text using the Lexer.
  static *Lex(Text: string) {
    const Tokenizer = new Lexer(SourceText.From(Text));
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      yield Token;
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  // Syntax analysis: Generates a syntax tree from the input text using the Parser.
  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).ParseSyntaxTree();
  }

  // Context analysis: Generates a bound syntax tree using the ouput tree from the Parser.
  static Bind(Text: string, Environment: Environment) {
    const Source = SourceText.From(Text);
    const Tree = new Parser(Source).ParseSyntaxTree();
    return new Binder(Environment).Bind(Tree);
  }
}
