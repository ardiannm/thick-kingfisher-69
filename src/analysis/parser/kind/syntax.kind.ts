import { BinaryOperatorKind } from "./binary.operator.kind";
import { CompositeTokenKind } from "./composite.token.kind";
import { SyntaxKeywordKind } from "./syntax.keyword.kind";
import { SyntaxNodeKind } from "./syntax.node.kind";
import { UnaryOperatorKind } from "./unary.operator.kind";
import { SyntaxTriviaKind } from "./syntax.trivia.kind";

export type SyntaxKind = SyntaxNodeKind | UnaryOperatorKind | BinaryOperatorKind | SyntaxTriviaKind | SyntaxKeywordKind | CompositeTokenKind;
