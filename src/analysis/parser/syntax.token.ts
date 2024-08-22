import { SyntaxNode } from "./syntax.node";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";
import { SyntaxBinaryOperatorKind } from "./kind/syntax.binary.operator.kind";
import { SyntaxCompositeTokenKind } from "./kind/syntax.composite.token.kind";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { Span } from "../text/span";
import { SyntaxTree } from "../../runtime/syntax.tree";

export type TokenTextMapper = {
  [SyntaxBinaryOperatorKind.PlusToken]: "+";
  [SyntaxBinaryOperatorKind.MinusToken]: "-";
  [SyntaxBinaryOperatorKind.StarToken]: "*";
  [SyntaxBinaryOperatorKind.SlashToken]: "/";
  [SyntaxBinaryOperatorKind.HatToken]: "^";
  [SyntaxNodeKind.OpenParenthesisToken]: "(";
  [SyntaxNodeKind.CloseParenthesisToken]: ")";
  [SyntaxNodeKind.OpenBraceToken]: "{";
  [SyntaxNodeKind.CloseBraceToken]: "}";
  [SyntaxNodeKind.DotToken]: ".";
  [SyntaxNodeKind.HashToken]: "#";
  [SyntaxNodeKind.GreaterToken]: ">";
  [SyntaxNodeKind.ColonToken]: ":";
  [SyntaxCompositeTokenKind.GreaterGreaterToken]: ">>";
  [SyntaxCompositeTokenKind.ColonColonToken]: "::";
  [SyntaxCompositeTokenKind.PointerToken]: "->";
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
  constructor(public override tree: SyntaxTree, public override kind: T, private tokenSpan: Span, public trivia = new Array<SyntaxToken<SyntaxKind>>()) {
    super(tree, kind);
  }

  loadTrivias(trivias: Array<SyntaxToken<SyntaxKind>>): void {
    while (trivias.length > 0) {
      this.trivia.push(trivias.shift() as SyntaxToken<SyntaxKind>);
    }
  }

  public override hasTrivia(): boolean {
    return this.trivia.length > 0;
  }

  override *getChildren(): Generator<SyntaxNode, any, unknown> {
    yield this;
  }

  override getFirstChild(): SyntaxNode {
    return this;
  }

  override getLastChild(): SyntaxNode {
    return this;
  }

  override get span() {
    return this.tokenSpan;
  }

  public static create(tree: SyntaxTree, span: Span) {
    return new SyntaxToken(tree, SyntaxNodeKind.NoneToken, span);
  }
}
