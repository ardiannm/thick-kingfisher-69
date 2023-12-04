import { Lexer } from "../Lexer";
import { Parser } from "../Parser";
import { Diagnostics } from "./Diagnostics/Diagnostics";
import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { SourceText } from "./Text/SourceText";

export class SyntaxTree extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Expressions: Array<Expression>) {
    super(Kind);
  }

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

  static *ParseTokens(Text: string) {
    const Tokenizer = new Lexer(SourceText.From(Text));
    while (true) {
      const Token = Tokenizer.Lex();
      if (Token.Kind === SyntaxKind.EndOfFileToken) break;
      yield Token;
    }
  }

  static Parse(Text: string) {
    return new Parser(SourceText.From(Text), new Diagnostics());
  }
}
