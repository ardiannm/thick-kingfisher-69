export enum BoundKind {
  BoundBinaryExpression,
  BoundCellReference,
  BoundCompilationUnit,
  BoundSyntaxError,
  BoundNumericLiteral,
  BoundScope,
  BoundUnaryExpression,
  BoundNone,
  BoundCellAssignment,
}

export enum BoundBinaryOperatorKind {
  Addition,
  Subtraction,
  Multiplication,
  Division,
  Exponentiation,
}

export enum BoundUnaryOperatorKind {
  Identity,
  Negation,
}
