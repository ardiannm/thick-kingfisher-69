export enum BoundKind {
  BoundBinaryExpression = "BoundBinaryExpression",
  BoundBlock = "BoundBlock",
  BoundCellReference = "BoundCellReference",
  BoundCompilationUnit = "BoundCompilationUnit",
  BoundSyntaxError = "BoundSyntaxError",
  BoundNumericLiteral = "BoundNumericLiteral",
  BoundScope = "BoundScope",
  BoundUnaryExpression = "BoundUnaryExpression",
  BoundNone = "BoundNone",
  BoundCellAssignment = "BoundCellAssignment",
}

export enum BoundBinaryOperatorKind {
  Addition = "Addition",
  Subtraction = "Subtraction",
  Multiplication = "Multiplication",
  Division = "Division",
  Exponentiation = "Exponentiation",
}

export enum BoundUnaryOperatorKind {
  Identity = "Identity",
  Negation = "Negation",
}
