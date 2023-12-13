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
      Text += this.Color(`${Node}`, Color.Terracotta);
    }
    if (typeof Node === "number") {
      Text += this.Color(`${Node}`, Color.Sage);
    }
    if (Node instanceof Set) {
      return this.Print(Array.from(Node));
    }
    if (Node instanceof Array) {
      for (const Item of Node) {
        Text += this.Print(Item, Indent) + " ";
      }
    }
    if (Node instanceof BoundNode) {
      for (const [Root, Branch] of Object.entries(Node)) {
        const NewIndent = Indent + " ".repeat(1);
        if (Root === "Kind") {
          Text += "\n" + Indent + NewIndent + this.Color(Node.Kind, Color.Azure);
        } else {
          Text += "\n" + Indent + NewIndent + " ".repeat(1) + this.Color(Root.toLowerCase(), Color.Moss) + " " + this.Print(Branch, NewIndent);
        }
      }
    }
    return Text;
  }

  private static Color(Text: string, Hex: string): string {
    return this.HexToColorCode(Hex) + Text + "\x1b[0m";
  }

  private static HexToRgb(Hex: string): RgbColor {
    // Remove the hash and parse the hex color code to RGB values
    const BingInt = parseInt(Hex.substring(1), 16);
    const r = (BingInt >> 16) & 255;
    const g = (BingInt >> 8) & 255;
    const b = BingInt & 255;
    return new RgbColor(r, g, b);
  }

  public static HexToColorCode(Hex: string) {
    const RgbColor = this.HexToRgb(Hex);
    return `\x1b[38;2;${RgbColor.r};${RgbColor.g};${RgbColor.b}m`;
  }
}

class RgbColor {
  constructor(public r: number, public g: number, public b: number) {}
}

enum Color {
  Turquoise = "#4ec9b0",
  Terracotta = "#ce9178",
  Moss = "#6a9955",
  Buff = "#dcdcaa",
  Azure = "#569cd6",
  Sage = "#b5cea8",
}
