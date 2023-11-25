export enum SyntaxKind {
  // BasicTokens
  SpaceToken = "SpaceToken",
  IdentifierToken = "IdentifierToken",
  NumberToken = "NumberToken",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  SlashToken = "SlashToken",
  StarToken = "StarToken",
  ColonToken = "ColonToken",
  OpenParenToken = "OpenParenToken",
  CloseParenToken = "CloseParenToken",
  GreaterToken = "GreaterToken",
  // Keywords
  FalseToken = "FalseToken",
  TrueToken = "TrueToken",
  // CompositeTokens
  PointerToken = "PointerToken",
  // Expressions
  SyntaxTree = "SyntaxTree",
  ReferenceExpression = "ReferenceExpression",
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  ParenthesizedExpression = "ParenthesizedExpression",
  RangeReference = "RangeReference",
  CellReference = "CellReference",
  Expression = "Expression",
  // HelperTokens
  EndOfFileToken = "EndOfFileToken",
  BadToken = "BadToken",
}
