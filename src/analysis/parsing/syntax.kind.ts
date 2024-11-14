export enum SyntaxKind {
  EndOfFileToken = "EOF",
  NumberToken = "NumberToken",
  ColonToken = "ColonToken",
  OpenParenthesisToken = "OpenParenthesisToken",
  CloseParenthesisToken = "CloseParenthesisToken",
  DotToken = "DotToken",
  GreaterToken = "GreaterToken",
  HashToken = "HashToken",
  BinaryExpression = "SyntaxBinaryExpression",
  IdentifierToken = "IdentifierToken",
  BadToken = "BadToken",
  EqualsToken = "EqualsToken",
  OpenBraceToken = "OpenBraceToken",
  CloseBraceToken = "CloseBraceToken",
  SyntaxCompilationUnit = "SyntaxCompilationUnit",
  SyntaxBlock = "SyntaxBlock",
  SyntaxCellAssignment = "SyntaxCellAssignment",
  SyntaxUnaryExpression = "SyntaxUnaryExpression",
  SyntaxParenthesis = "SyntaxParenthesizedExpression",
  SyntaxCellReference = "SyntaxCellReference",
  SyntaxExpression = "Expression",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  StarToken = "StarToken",
  SlashToken = "SlashToken",
  HatToken = "HatToken",
  CommentTrivia = "CommentTrivia",
  SpaceTrivia = "SpaceTrivia",
  ColonColonToken = "ColonColonToken",
  LineBreakTrivia = "LineBreakTrivia",
}

export enum SyntaxUnaryOperatorKind {
  PlusToken,
  MinusToken,
}

export enum SyntaxBinaryOperatorKind {
  PlusToken,
  MinusToken,
  StarToken,
  SlashToken,
  HatToken,
}

export type Kind = SyntaxKind | SyntaxUnaryOperatorKind | SyntaxBinaryOperatorKind;
