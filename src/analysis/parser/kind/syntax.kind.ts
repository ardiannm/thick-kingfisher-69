import { BinaryOperatorKind } from "./binary.operator.kind";
import { CompositeTokenKind } from "./composite.token.kind";
import { SyntaxKeywordKind } from "./syntax.keyword.kind";
import { SyntaxNodeKind } from "./syntax.node.kind";
import { SyntaxUnaryOperatorKind } from "./syntax.unary.operator.kind";
import { SyntaxTriviaKind } from "./syntax.trivia.kind";

export type SyntaxKind = SyntaxNodeKind | SyntaxUnaryOperatorKind | BinaryOperatorKind | SyntaxTriviaKind | SyntaxKeywordKind | CompositeTokenKind;
