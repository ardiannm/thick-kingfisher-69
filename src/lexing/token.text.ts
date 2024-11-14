import { SyntaxNodeKind } from "../analysis/parsing/kind/syntax.node.kind";
import { SyntaxTriviaKind } from "../analysis/parsing/kind/syntax.trivia.kind";
import { SyntaxBinaryOperatorKind } from "../analysis/parsing/kind/syntax.binary.operator.kind";
import { SyntaxCompositeTokenKind } from "../analysis/parsing/kind/syntax.composite.token.kind";
import { SyntaxKeywordKind } from "../analysis/parsing/kind/syntax.keyword.kind";
import { SyntaxKind } from "../analysis/parsing/kind/syntax.kind";

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
  [SyntaxNodeKind.EqualsToken]: "=";
  [SyntaxCompositeTokenKind.ColonColonToken]: "::";
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
