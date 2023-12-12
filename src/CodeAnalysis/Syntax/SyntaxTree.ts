import { Lexer } from "../Lexer";
import { Parser } from "../Parser";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";
import { SourceText } from "../SourceText/SourceText";
import { Binder } from "../Binder";
import { BoundNode } from "../Binding/BoundNode";
import { BoundProgram } from "../Binding/BoundProgram";

export class SyntaxTree {
  private constructor(public Root: BoundNode) {}

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

  static Bind(Text: string) {
    const Source = SourceText.From(Text);
    const Tree = new Parser(Source).Parse();
    return new Binder().Bind(Tree) as BoundProgram;
  }

  public static Print<T>(Node: T, Indent = ""): string {
    var Text = "";
    if (typeof Node === "string") {
      return `"${Node}"`;
    }
    if (typeof Node === "number") {
      return `${Node}`;
    }
    if (Node instanceof Set) {
      return this.Print(Array.from(Node));
    }
    if (Node instanceof Array) {
      for (const Item of Node) {
        Text += this.Print(Item, Indent) + " ";
      }
      return Text;
    }
    if (Node instanceof BoundNode) {
      for (const [Root, Branch] of Object.entries(Node)) {
        const NewIndent = Indent + " ".repeat(3);
        if (Root === "Kind") {
          Text += "\n" + Indent + NewIndent + Node.Kind;
        } else {
          Text += "\n" + Indent + NewIndent + " ".repeat(3) + Root + " " + this.Print(Branch, NewIndent);
        }
      }
    }
    return Text;
  }
}
