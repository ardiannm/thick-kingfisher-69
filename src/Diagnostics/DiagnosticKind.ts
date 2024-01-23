export enum DiagnosticKind {
  EmptyProgram = "EmptyProgram",
  BadTokenFound = "BadTokenFound",
  TokenNotAMatch = "TokenNotAMatch",
  CantDivideByZero = "CantDivideByZero",
  CircularDependency = "CircularDependency",
  CantUseAsAReference = "CantUseAsAReference",
  UndeclaredCell = "UndeclaredCell",
  BadFloatingPointNumber = "BadFloatingPointNumber",
  BinderMethod = "BinderMethod",
  EvaluatorMethod = "EvaluatorMethod",
  InvalidCellState = "InvalidCellState",
  AutoDeclaredCell = "AutoDeclaredCell",
}
