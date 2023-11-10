export enum SyntaxKind {
  // TOKENS
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

  // SPECIAL TOKENS
  EOFToken = "EOFToken",
  ExceptionToken = "ExceptionToken",

  // NODES

  // PRIMARY
  NumberExpression = "NumberExpression",
  IndentifierExpression = "IndentifierExpression",

  // EXPRESSION
  RowReference = "RowReference",
  ColumnReference = "ColumnReference",
  CellReference = "CellReference",
  RangeReference = "RangeReference",
  ParanthesisExpression = "ParanthesisExpression",
  UnaryExpression = "UnaryExpression",
  BinaryExpression = "BinaryExpression",

  // STATEMENTS
  ReferenceStatement = "ReferenceStatement",

  Exception = "Exception",
}
