export enum SyntaxKind {
  SpaceToken = "SpaceToken",
  IdentifierToken = "IndentifierToken",
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
  EOFToken = "EOFToken",
  BadToken = "ExceptionToken",

  NumberExpression = "NumberExpression",
  IdentifierExpression = "IndentifierExpression",

  RowReference = "RowReference",
  ColumnReference = "ColumnReference",
  CellReference = "CellReference",
  RangeReference = "RangeReference",

  ParanthesisExpression = "ParanthesisExpression",
  UnaryExpression = "UnaryExpression",
  BinaryExpression = "BinaryExpression",

  ReferenceSyntax = "ReferenceStatement",

  SyntaxTree = "SyntaxTree",
}
