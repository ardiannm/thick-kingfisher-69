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

  // Helper method to print the tree structure for debugging and visualization.
  Print(Node: SyntaxNode = this, Indentation = "") {
    var Text = "";
    for (const Child of Node.GetChildren()) {
      var Kind = Child.Node.Kind + "";
      if (Child.isLast) {
        Text += Indentation + "└── " + Kind + "\n" + this.Print(Child.Node, Indentation + "    ");
      } else {
        Text += Indentation + "├── " + Kind + "\n" + this.Print(Child.Node, Indentation + "│   ");
      }
    }
    return Text;
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
    return new Parser(SourceText.From(Text)).ParseSyntaxTree();
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
