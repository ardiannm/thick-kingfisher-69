import { SyntaxNode } from "./syntax.node";
import { SyntaxKind } from "./kind/syntax.kind";
import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";
import { BinaryOperatorKind } from "./kind/binary.operator.kind";
import { CompositeTokenKind } from "./kind/composite.token.kind";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { TokenSpan } from "../text/token.span";
import { SyntaxTree } from "./syntax.tree";

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
  constructor(public override tree: SyntaxTree, public override kind: T, public span: TokenSpan, public trivia = new Array<SyntaxToken<SyntaxKind>>()) {
    super(tree, kind);
  }

  loadTrivias(trivias: Array<SyntaxToken<SyntaxKind>>): void {
    while (trivias.length > 0) {
      this.trivia.push(trivias.shift() as SyntaxToken<SyntaxKind>);
    }
  }

  hasTrivia() {
    return this.trivia.length;
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

  override getSpan() {
    return this.span;
  }
}
