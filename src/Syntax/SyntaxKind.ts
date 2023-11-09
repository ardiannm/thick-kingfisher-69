export enum SyntaxKind {
  SpaceToken = "SpaceToken",
  IndentifierToken = "IndentifierToken",
  NumberToken = "NumberToken",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  SlashToken = "SlashToken",
  StarToken = "StarToken",
  ColonToken = "ColonToken",
  OpenParenthesisToken = "OpenParenthesisToken",
  CloseParenthesisToken = "CloseParenthesisToken",
  GreaterToken = "GreaterToken",
  PointerToken = "PointerToken",

  // Special tokens
  EOFToken = "EOFToken",
  ExceptionToken = "ExceptionToken",

  // Nodes

  // Primary
  NumberExpression = "NumberExpression",
  IndentifierExpression = "IndentifierExpression",

  // Expression
  RowReference = "RowReference",
  ColumnReference = "ColumnReference",
  CellReference = "CellReference",
  RangeReference = "RangeReference",
  ParanthesisExpression = "ParanthesisExpression",
  UnaryExpression = "UnaryExpression",
  BinaryExpression = "BinaryExpression",

  // Statements
  ReferenceStatement = "ReferenceStatement",

  Exception = "Exception",
}
