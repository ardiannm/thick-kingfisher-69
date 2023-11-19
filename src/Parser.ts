import { Lexer } from "./Lexer";
import { SyntaxKind } from "./CodeAnalysis/SyntaxKind";
import { SyntaxToken } from "./CodeAnalysis/SyntaxToken";
import { CellReference, BinaryExpression, UnaryExpression, ParenthesizedExpression, RangeReference, ReferenceDeclaration, Expression } from "./CodeAnalysis/SyntaxNode";
import { SyntaxFacts } from "./CodeAnalysis/SyntaxFacts";

export class Parser {
  public Diagnostics = new Array<string>();

  private Tokens = new Array<SyntaxToken>();
  private Stack = new Set<string>(); // Set To Store Parsed Cell Text References
  private Pointer = 0;

  constructor(public readonly Input: string) {
    const Tokenizer = new Lexer(Input);
    var Token: SyntaxToken;
    do {
      Token = Tokenizer.Lex();
      if (!(Token.Kind === SyntaxKind.SpaceToken) && !(Token.Kind === SyntaxKind.BadToken)) {
        this.Tokens.push(Token);
      }
      if (Token.Kind === SyntaxKind.BadToken) {
        this.Report(`SyntaxError: <${Token.Kind}> Found While Parsing;`);
      }
    } while (Token.Kind !== SyntaxKind.EndOfFileToken);
    console.log(this.Tokens);
  }

  // Get The Next Token Without Consuming It
  private PeekToken(Offset: number) {
    const Index = this.Pointer + Offset;
    const LastIndex = this.Tokens.length - 1;
    if (Index > LastIndex) return this.Tokens[LastIndex];
    return this.Tokens[Index];
  }

  private Current() {
    return this.PeekToken(0);
  }

  // Consume And Return The Next Token
  private NextToken() {
    const Token = this.Current();
    this.Pointer++;
    return Token;
  }

  // Helper Method To Check If The Next Token Matches The Given Kinds
  private MatchToken(...Kinds: Array<SyntaxKind>) {
    let Offset = 0;
    for (const Kind of Kinds) {
      if (Kind !== this.PeekToken(Offset).Kind) return false;
      Offset++;
    }
    return true;
  }

  private ExpectToken(Kind: SyntaxKind) {
    if (this.MatchToken(Kind)) return this.NextToken();
    const Token = this.Current();
    this.Report(`SyntaxError: Expected <${Kind}> Found <${Token.Kind}>;`);
    return new SyntaxToken(Kind, Token.Text);
  }

  private Report(message: string) {
    this.Diagnostics.push(message);
  }

  // Main Parsing Method
  public Parse() {
    return this.ParseReference();
  }

  private ParseReference() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.PointerToken)) {
      this.NextToken();
      this.Stack.clear();
      const Right = this.ParseExpression();
      const Node = new ReferenceDeclaration(SyntaxKind.ReferenceDeclaration, Left, Array.from(this.Stack), Right);
      this.Stack.clear();
      return Node;
    }
    return Left;
  }

  // Parse Expressions With Binary Operators
  private ParseExpression(ParentPrecedence = 0) {
    let Left: Expression;
    const UnaryPrecendence = SyntaxFacts.UnaryOperatorPrecedence(this.Current().Kind);
    if (UnaryPrecendence !== 0 && UnaryPrecendence >= ParentPrecedence) {
      const Operator = this.NextToken();
      const Operand = this.ParseExpression();
      Left = new UnaryExpression(SyntaxKind.UnaryExpression, Operator, Operand);
    } else {
      Left = this.ParseParenthesis();
    }
    while (true) {
      const BinaryPrecedence = SyntaxFacts.BinaryOperatorPrecedence(this.Current().Kind);
      if (BinaryPrecedence === 0 || BinaryPrecedence <= ParentPrecedence) {
        break;
      }
      const Operator = this.NextToken();
      const Right = this.ParseExpression(BinaryPrecedence);
      Left = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Left;
  }

  // Parse Expressions Enclosed In Parentheses
  private ParseParenthesis() {
    if (this.MatchToken(SyntaxKind.OpenParenToken)) {
      const Left = this.NextToken();
      const Expression = this.ParseExpression();
      const Right = this.ExpectToken(SyntaxKind.CloseParenToken);
      return new ParenthesizedExpression(SyntaxKind.ParenthesizedExpression, Left, Expression, Right);
    }
    return this.ParseRange();
  }

  // Parse Range Reference (e.g., B4:C, B:E)
  private ParseRange() {
    const Left = this.ParseCell();
    if (this.MatchToken(SyntaxKind.ColonToken)) {
      this.NextToken();
      const Right = this.ParseCell();
      return new RangeReference(SyntaxKind.RangeReference, Left, Right);
    }
    return Left;
  }

  // Parse Cell Reference (e.g., A1, B7)
  private ParseCell() {
    if (this.MatchToken(SyntaxKind.IdentifierToken, SyntaxKind.NumberToken)) {
      const Left = this.NextToken();
      const Right = this.NextToken();
      const Text = Left.Text + Right.Text;
      this.Stack.add(Text); // Add Cell Reference To The Stack Of References
      return new CellReference(SyntaxKind.CellReference, Left, Right);
    }
    return this.ParseLiteral();
  }

  // Parse Literals (e.g., Numbers, Identifiers, True)
  private ParseLiteral() {
    const Kind = this.Current().Kind;
    switch (Kind) {
      case SyntaxKind.TrueToken:
      case SyntaxKind.FalseToken:
      case SyntaxKind.IdentifierToken:
        return this.NextToken();
      default:
        return this.ExpectToken(SyntaxKind.NumberToken);
    }
  }
}
