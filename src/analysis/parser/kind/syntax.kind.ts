import { SyntaxBinaryOperatorKind } from "./syntax.binary.operator.kind";
import { SyntaxCompositeTokenKind } from "./syntax.composite.token.kind";
import { SyntaxKeywordKind } from "./syntax.keyword.kind";
import { SyntaxNodeKind } from "./syntax.node.kind";
import { SyntaxUnaryOperatorKind } from "./syntax.unary.operator.kind";
import { SyntaxTriviaKind } from "./syntax.trivia.kind";

export type SyntaxKind = SyntaxNodeKind | SyntaxUnaryOperatorKind | SyntaxBinaryOperatorKind | SyntaxTriviaKind | SyntaxKeywordKind | SyntaxCompositeTokenKind;
