import { SyntaxNode } from "./syntax.node";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";
import { BinaryOperatorKind } from "./kind/binary.operator.kind";
import { CompositeTokenKind } from "./kind/composite.token.kind";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { Span } from "../input/token.span";

export type TokenTextMapper = {
  [BinaryOperatorKind.PlusToken]: "+";
  [BinaryOperatorKind.MinusToken]: "-";
  [BinaryOperatorKind.StarToken]: "*";
  [BinaryOperatorKind.SlashToken]: "/";
  [BinaryOperatorKind.HatToken]: "^";
  [SyntaxNodeKind.OpenParenthesisToken]: "(";
  [SyntaxNodeKind.CloseParenthesisToken]: ")";
  [SyntaxNodeKind.OpenBraceToken]: "{";
  [SyntaxNodeKind.CloseBraceToken]: "}";
  [SyntaxNodeKind.DotToken]: ".";
  [SyntaxNodeKind.HashToken]: "#";
  [SyntaxNodeKind.GreaterToken]: ">";
  [SyntaxNodeKind.ColonToken]: ":";
  [CompositeTokenKind.GreaterGreaterToken]: ">>";
  [CompositeTokenKind.ColonColonToken]: "::";
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
  constructor(public override Kind: T, public Text: TokenText<T>, private TokenSpan: Span, public Trivia = new Array<SyntaxToken<SyntaxKind>>()) {
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
    return this.TokenSpan.Input.GetLineSpan(this.TokenSpan.Start);
  }
}
