import { SyntaxNode } from "./SyntaxNode";
import { TokenSpan } from "../../Input/TokenSpan";
import { SyntaxKind } from "./Kind/SyntaxKind";
import { SyntaxNodeKind } from "./Kind/SyntaxNodeKind";
import { SyntaxTriviaKind } from "./Kind/SyntaxTriviaKind";
import { BinaryOperatorKind } from "./Kind/BinaryOperatorKind";
import { CompositeTokenKind } from "./Kind/CompositeTokenKind";
import { SyntaxKeywordKind } from "./Kind/SyntaxKeywordKind";
import { ColorPalette } from "../../View/ColorPalette";

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
  constructor(public override Kind: T, public Text: TokenText<T>, private TokenSpan: TokenSpan, public Trivia = new Array<SyntaxToken<SyntaxKind>>()) {
    super(Kind);
  }

  EatTrivia(Trivias: Array<SyntaxToken<SyntaxKind>>): SyntaxToken<SyntaxKind> {
    while (Trivias.length > 0) {
      this.Trivia.push(Trivias.shift() as SyntaxToken<SyntaxKind>);
    }
    return this;
  }

  override *Children(): Generator<SyntaxNode, any, unknown> {
    yield this;
  }

  override First(): SyntaxNode {
    return this;
  }

  override Last(): SyntaxNode {
    return this;
  }

  override get Span() {
    return this.TokenSpan;
  }

  get Line() {
    return this.TokenSpan.Input.GetLinePosition(this.TokenSpan);
  }

  get Column() {
    return this.TokenSpan.Start - this.TokenSpan.Input.GetLineSpan(this.Line).Start + 1;
  }

  override Print() {
    var Text = "";
    Text += ColorPalette.Teal("'");
    Text += ColorPalette.Teal(this.Kind);
    Text += ColorPalette.Teal("'");
    Text += ColorPalette.Default(":");
    Text += " ";
    Text += ColorPalette.Teal("'");
    Text += ColorPalette.Teal(this.Text);
    Text += ColorPalette.Teal("'");
    Text += " ";
    var TextTrivia = "";
    for (const Trivia of this.Trivia) {
      TextTrivia += ColorPalette.Default(Trivia.Kind);
      TextTrivia += " ";
    }
    Text += TextTrivia;
    return Text;
  }
}
