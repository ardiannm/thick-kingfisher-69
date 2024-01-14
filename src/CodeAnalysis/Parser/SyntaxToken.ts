import { TextSpan } from "../../Text/TextSpan";
import { SyntaxKind } from "./SyntaxKind";
import { SyntaxNode } from "./SyntaxNode";

export type TokenMap = {
  [SyntaxKind.PlusToken]: "+";
  [SyntaxKind.MinusToken]: "-";
  [SyntaxKind.StarToken]: "*";
  [SyntaxKind.SlashToken]: "/";
  [SyntaxKind.OpenParenthesisToken]: "(";
  [SyntaxKind.CloseParenthesisToken]: ")";
  [SyntaxKind.HatToken]: "^";
  [SyntaxKind.DotToken]: ".";
  [SyntaxKind.HashToken]: "#";
  [SyntaxKind.GreaterToken]: ">";
  [SyntaxKind.GreaterGreaterToken]: ">>";
  [SyntaxKind.EndOfFileToken]: "";
  [SyntaxKind.TrueKeyword]: "true";
  [SyntaxKind.FalseKeyword]: "false";
  [SyntaxKind.PointerToken]: "->";
  [SyntaxKind.LineBreakTrivia]: "\n";
  [SyntaxKind.IdentifierToken]: string;
  [SyntaxKind.NumberToken]: `${number}`;
  [SyntaxKind.SpaceTrivia]: string;
  [SyntaxKind.CommentTrivia]: string;
  [SyntaxKind.BadToken]: string;
};

export type TokenText<T extends SyntaxKind> = T extends keyof TokenMap ? TokenMap[T] : never;

export class SyntaxToken<T extends SyntaxKind> extends SyntaxNode {
  constructor(
    public override Kind: T,
    public Text: TokenText<T>,
    private Span: TextSpan,
    public Trivia = new Array<SyntaxToken<SyntaxKind>>()
  ) {
    super(Kind);
  }

  EatTrivia(Trivias: Array<SyntaxToken<SyntaxKind>>): SyntaxToken<SyntaxKind> {
    while (Trivias.length > 0) {
      this.Trivia.push(Trivias.shift() as SyntaxToken<SyntaxKind>);
    }
    return this;
  }

  public override TextSpan() {
    return this.Span;
  }

  public override First(): SyntaxNode {
    return this;
  }

  public override Last(): SyntaxNode {
    return this;
  }
}
