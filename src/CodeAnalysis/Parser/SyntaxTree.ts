import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../Text/SourceText";
import { Binder } from "../Binder/Binder";
import { BoundNode } from "../Binder/BoundNode";
import { BoundProgram } from "../Binder/BoundProgram";
import { BoundScope } from "../Binder/BoundScope";
import { Rewriter } from "../Rewriter/Rewriter";
import { Evaluator } from "../../Evaluator";
import { SyntaxNode } from "./SyntaxNode";
import { Interpreter } from "../Interpreter/Interpreter";
import { Color } from "../Interpreter/Color";

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

  static Evaluate(Text: string) {
    const Tree = SyntaxTree.Parse(Text);
    return new Evaluator(new BoundScope(undefined)).Evaluate(new Binder().Bind(Tree));
  }

  static EvaluateRewritten(Text: string) {
    const Tree = SyntaxTree.Rewrite(Text);
    return new Evaluator(new BoundScope(undefined)).Evaluate(new Binder().Bind(Tree));
  }

  static Print(Node: SyntaxNode, Indent = "") {
    let Text = "";
    Text += Interpreter.Color(Node.Kind.toString(), Color.Moss);

    if (Node instanceof SyntaxToken) {
      return Text + " " + Interpreter.Color(Node.Text, Color.Sage);
    }

    if (Node instanceof SyntaxNode) {
      const Branches = Array.from(Node.GetBranches());
      for (const [Index, Branch] of Branches.entries()) {
        const LastBranch = Index + 1 == Branches.length;
        const Lead = LastBranch ? "└── " : "├── ";
        Text += "\n" + Interpreter.Color(Indent + Lead, Color.Sage) + this.Print(Branch, Indent + (LastBranch ? "   " : "│  "));
      }
    }
    return Text;
  }
}
