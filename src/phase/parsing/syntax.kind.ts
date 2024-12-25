export enum SyntaxKind {
  EndOfFileToken = "EndOfFileToken",
  NumberToken = "NumberToken",
  ColonToken = "ColonToken",
  OpenParenthesisToken = "OpenParenthesisToken",
  CloseParenthesisToken = "CloseParenthesisToken",
  DotToken = "DotToken",
  GreaterToken = "GreaterToken",
  HashToken = "HashToken",
  SyntaxBinaryExpression = "SyntaxBinaryExpression",
  Expression = "SyntaxExpression",
  IdentifierToken = "IdentifierToken",
  BadToken = "BadToken",
  OpenBraceToken = "OpenBraceToken",
  CloseBraceToken = "CloseBraceToken",
  SyntaxCompilationUnit = "SyntaxCompilationUnit",
  SyntaxBlock = "SyntaxBlock",
  SyntaxCellAssignment = "SyntaxCellAssignment",
  SyntaxUnaryExpression = "SyntaxUnaryExpression",
  SyntaxParenthesis = "SyntaxParenthesis",
  SyntaxCellReference = "SyntaxCellReference",
  SyntaxError = "SyntaxError",
  PlusToken = "PlusToken",
  MinusToken = "MinusToken",
  StarToken = "StarToken",
  SlashToken = "SlashToken",
  HatToken = "HatToken",
  CommentTrivia = "CommentTrivia",
  SpaceTrivia = "SpaceTrivia",
  ColonColonToken = "ColonColonToken",
  LineBreakTrivia = "LineBreakTrivia",
  QuoteToken = "QuoteToken",
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
