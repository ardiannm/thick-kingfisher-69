import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { UnaryOperatorKind } from "./parser/kind/unary.operator.kind";
import { SyntaxNode } from "./parser/syntax.node";
import { BinaryExpression } from "./parser/binary.expression";
import { CellReference } from "./parser/cell.reference";
import { SyntaxToken } from "./parser/syntax.token";
import { BoundBinaryExpression } from "./binder/binary.expression";
import { BoundKind } from "./binder/kind/bound.kind";
import { BoundNumericLiteral } from "./binder/numeric.literal";
import { BoundBinaryOperatorKind } from "./binder/kind/binary.operator.kind";
import { UnaryExpression } from "./parser/unary.expression";
import { BoundUnaryExpression } from "./binder/unary.expression";
import { BoundUnaryOperatorKind } from "./binder/kind/unary.operator.kind";
import { ParenthesizedExpression } from "./parser/parenthesized.expression";
import { BoundNode } from "./binder/bound.node";
import { BoundError } from "./binder/error";
import { Program } from "./parser/program";
import { BoundStatement } from "./binder/statement";
import { BoundProgram } from "./binder/program";
import { BoundScope } from "./binder/scope";
import { CellAssignment } from "./parser/cell.assignment";
import { Cell } from "../cell";
import { BoundCellAssignment } from "./binder/cell.assignment";
import { CompilerOptions } from "../compiler.options";
import { FunctionExpression } from "./parser/function.expression";
import { BoundFunctionExpression } from "./binder/function.expression";
import { DiagnosticBag } from "./diagnostics/diagnostic.bag";

export class Binder {
  Scope = new BoundScope(null, this.Configuration);
  constructor(private Diagnostics: DiagnosticBag, public Configuration: CompilerOptions) {}

  public Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxNodeKind.Program:
        return this.BindProgram(Node as NodeType<Program>);
      case SyntaxNodeKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
      case SyntaxNodeKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxNodeKind.UnaryExpression:
        return this.BindUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.BindBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxNodeKind.CellAssignment:
        return this.BindCellAssignment(Node as NodeType<CellAssignment>);
      case SyntaxNodeKind.FunctionExpression:
        return this.BindFunctionExpression(Node as NodeType<FunctionExpression>);
    }
    this.Diagnostics.BinderMethod(Node.Kind);
    return new BoundError(BoundKind.Error, Node.Kind);
  }

  private BindFunctionExpression(Node: FunctionExpression): BoundNode {
    const Statements = new Array<BoundStatement>();
    for (const Statement of Node.Body) Statements.push(this.Bind(Statement));
    return new BoundFunctionExpression(BoundKind.FunctionExpression, Node.Name.Text, Statements);
  }

  private BindProgram(Node: Program) {
    const Root = new Array<BoundStatement>();
    for (const Statement of Node.Root) Root.push(this.Bind(Statement));
    this.Scope.CheckDeclarations(this.Diagnostics);
    return new BoundProgram(BoundKind.Program, Root);
  }

  private BindCellAssignment(Node: CellAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxNodeKind.CellReference:
        const Subject = this.Bind(Node.Left) as Cell;
        const AssignmentScope = new BoundScope(this.Scope, this.Configuration);
        this.Scope = AssignmentScope as BoundScope;
        Subject.Expression = this.Bind(Node.Expression);
        Subject.ClearDependencies();
        for (const Dep of this.Scope.Cells.values()) {
          Subject.Track(Dep);
          if (Dep.Declared) continue;
          if (this.Configuration.Settings.AutoDeclaration) {
            this.Diagnostics.AutoDeclaredCell(Dep, Subject);
            Dep.Declared = true;
            this.Scope.Move(Dep);
          }
        }
        this.Scope = this.Scope.ParentScope as BoundScope;
        Subject.Declared = true;
        Subject.Formula = Node.Expression.Span.GetText();
        return new BoundCellAssignment(BoundKind.CellAssignment, Subject);
    }
    this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
    return new BoundNode(BoundKind.CellAssignment);
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindBinaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BinaryExpression, Left, Operator, Right);
  }

  private BindBinaryOperatorKind(Kind: BinaryOperatorKind): BoundBinaryOperatorKind {
    switch (Kind) {
      case BinaryOperatorKind.PlusToken:
        return BoundBinaryOperatorKind.Addition;
      case BinaryOperatorKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction;
      case BinaryOperatorKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication;
      case BinaryOperatorKind.SlashToken:
        return BoundBinaryOperatorKind.Division;
      case BinaryOperatorKind.HatToken:
        return BoundBinaryOperatorKind.Exponentiation;
    }
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    const Right = this.Bind(Node.Right);
    switch (Node.Operator.Kind) {
      case UnaryOperatorKind.MinusToken:
      case UnaryOperatorKind.PlusToken:
        const Operator = this.BindUnaryOperatorKind(Node.Operator.Kind);
        return new BoundUnaryExpression(BoundKind.UnaryExpression, Operator, Right);
    }
  }

  private BindUnaryOperatorKind(Kind: UnaryOperatorKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case UnaryOperatorKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case UnaryOperatorKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  private BindCellReference(Node: CellReference) {
    const Name = Node.Span.GetText();
    const Row = Node.Right.Span.GetText();
    const Column = Node.Left.Span.GetText();
    if (this.Configuration.Settings.CompactCellNames && Node.Right.Trivia.length) {
      this.Diagnostics.WrongCellNameFormat(Node.Left.Span.GetText() + Node.Right.Span.GetText());
      return new BoundError(BoundKind.Error, Node.Kind);
    }
    return this.Scope.ConstructCell(Name, Row, Column);
  }

  private BindNumber(Node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const Value = parseFloat(Node.Text);
    return new BoundNumericLiteral(BoundKind.NumericLiteral, Value);
  }
}
