import { Lexer } from "../Lexer";
import { Parser } from "../Parser";
import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "./Text/SourceText";
import { Evaluator } from "../Evaluator";
import { Binder } from "../Binder";

// SyntaxTree class represents the abstract syntax tree (AST) of the programming language.

export class SyntaxTree extends SyntaxNode {
  // Constructor for SyntaxTree.
  constructor(public Kind: SyntaxKind, public Expressions: Array<Expression>) {
    super(Kind);
  }

  // Helper method to print the tree structure for visualization.
  Print(Node: SyntaxNode = this, Indentation = "") {
    var View = "";
    for (const Branch of Node.GetBranches()) {
      var Kind = Branch.Node.Kind + "";
      if (Branch.isLast) {
        View += Indentation + "└── " + Kind + "\n" + this.Print(Branch.Node, Indentation + "    ");
      } else {
        View += Indentation + "├── " + Kind + "\n" + this.Print(Branch.Node, Indentation + "│   ");
      }
    }
    return View;
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

  // Syntax analysis: Generates an abstract syntax tree (AST) from the input text using the Parser.
  static Parse(Text: string) {
    const Source = SourceText.From(Text);
    return new Parser(Source).ParseSyntaxTree();
  }

  // Binding: Binds the syntax tree to symbols and performs semantic analysis.
  static Bind(Text: string) {
    return new Binder().Bind(this.Parse(Text));
  }

  // Evaluation: Executes the program represented by the syntax tree using the Evaluator.
  static Evaluate(Text: string) {
    return new Evaluator().Evaluate(this.Bind(Text));
  }
}
