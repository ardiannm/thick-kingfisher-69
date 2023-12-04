import { Lexer } from "../Lexer";
import { Parser } from "../Parser";
import { Expression } from "./Expression";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";
import { SyntaxToken } from "./SyntaxToken";
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

  static *Lex(Text: string) {
    const Tokenizer = new Lexer(SourceText.From(Text));
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      yield Token;
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
  }

  static Parse(Text: string) {
    return new Parser(SourceText.From(Text)).ParseSyntaxTree();
  }
}
