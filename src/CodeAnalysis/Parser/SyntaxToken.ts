import { SyntaxNode } from "./SyntaxNode";
import { TextSpan } from "../../Text/TextSpan";
import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";
import { SyntaxKeywordKind } from "./Kind/SyntaxKeywordKind";
import { Painter } from "../../Text/Painter";

export type TokenTextMapper = {
  [BinaryOperatorKind.PlusToken]: "+";
  [BinaryOperatorKind.MinusToken]: "-";
  [BinaryOperatorKind.StarToken]: "*";
  [BinaryOperatorKind.SlashToken]: "/";
  [BinaryOperatorKind.HatToken]: "^";
  [SyntaxNodeKind.OpenParenthesisToken]: "(";
  [SyntaxNodeKind.CloseParenthesisToken]: ")";
  [SyntaxNodeKind.DotToken]: ".";
  [SyntaxNodeKind.HashToken]: "#";
  [SyntaxNodeKind.GreaterToken]: ">";
  [CompositeTokenKind.GreaterGreaterToken]: ">>";
  [CompositeTokenKind.PointerToken]: "->";
  [SyntaxKeywordKind.TrueKeyword]: "true";
  [SyntaxKeywordKind.FalseKeyword]: "false";
  [SyntaxNodeKind.EndOfFileToken]: "";
  [SyntaxNodeKind.IdentifierToken]: string;
  [SyntaxNodeKind.NumberToken]: `${number}`;
  [SyntaxNodeKind.BadToken]: string;
  [SyntaxTriviaKind.LineBreakTrivia]: "\n";
  [SyntaxTriviaKind.SpaceTrivia]: string;
  [SyntaxTriviaKind.CommentTrivia]: string;
};

export type TokenText<Kind extends SyntaxKind> = Kind extends keyof TokenTextMapper ? TokenTextMapper[Kind] : never;

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

  public override *Children(): Generator<SyntaxNode, any, unknown> {
    yield this;
  }

  public override First(): SyntaxNode {
    return this;
  }

  public override Last(): SyntaxNode {
    return this;
  }

  public override TextSpan() {
    return this.Span;
  }

  public override Print() {
    var Text = "";
    Text += Painter.Teal("'");
    Text += Painter.Teal(this.Kind);
    Text += Painter.Teal("'");
    Text += Painter.Default(":");
    Text += " ";
    Text += Painter.Teal("'");
    Text += Painter.Teal(this.Text);
    Text += Painter.Teal("'");
    Text += " ";
    var TextTrivia = "";
    for (const Trivia of this.Trivia) {
      TextTrivia += Painter.Default(Trivia.Kind);
      TextTrivia += " ";
    }
    Text += TextTrivia;
    return Text;
  }
}
