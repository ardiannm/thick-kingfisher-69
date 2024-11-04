import { SyntaxNodeKind } from "./kind/syntax.node.kind";
import { SyntaxTriviaKind } from "./kind/syntax.trivia.kind";
import { SyntaxBinaryOperatorKind } from "./kind/syntax.binary.operator.kind";
import { SyntaxCompositeTokenKind } from "./kind/syntax.composite.token.kind";
import { SyntaxKeywordKind } from "./kind/syntax.keyword.kind";
import { SyntaxKind } from "./kind/syntax.kind";

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
  [SyntaxNodeKind.SingleQuoteToken]: "*";
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
