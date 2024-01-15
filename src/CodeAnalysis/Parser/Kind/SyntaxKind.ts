import { BinaryOperatorKind } from "./BinaryOperatorKind";
import { CompositeTokenKind } from "./CompositeTokenKind";
import { SyntaxKeywordKind } from "./SyntaxKeywordKind";
import { SyntaxNodeKind } from "./SyntaxNodeKind";
import { UnaryOperatorKind } from "./UnaryOperatorKind";
import { SyntaxTriviaKind } from "./SyntaxTriviaKind";

export type SyntaxKind =
  | SyntaxNodeKind
  | UnaryOperatorKind
  | BinaryOperatorKind
  | SyntaxTriviaKind
  | SyntaxKeywordKind
  | CompositeTokenKind;
