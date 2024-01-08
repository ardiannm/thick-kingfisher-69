export enum DiagnosticKind {
  EmptyProgram = "EmptyProgram",
  BadTokenFound = "BadTokenFound",
  TokenNotAMatch = "TokenNotAMatch",
  CantDivideByZero = "CantDivideByZero",
  MissingOperatorKind = "MissingOperatorKind",
  CircularDependency = "CircularDependency",
  CantUseAsAReference = "CantUseAsAReference",
  UndefinedCell = "UndefinedCell",
  BadFloatingPointNumber = "BadFloatingPointNumber",
  NotARangeMember = "NotARangeMember",
}
