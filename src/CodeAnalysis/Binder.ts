import { SyntaxNodeKind } from "./Parsing/Kind/SyntaxNodeKind";
import { BinaryOperatorKind } from "./Parsing/Kind/BinaryOperatorKind";
import { UnaryOperatorKind } from "./Parsing/Kind/UnaryOperatorKind";
import { SyntaxNode } from "./Parsing/SyntaxNode";
import { BinaryExpression } from "./Parsing/BinaryExpression";
import { CellReference } from "./Parsing/CellReference";
import { SyntaxToken } from "./Parsing/SyntaxToken";
import { BoundBinaryExpression } from "./Binding/BoundBinaryExpression";
import { BoundKind } from "./Binding/Kind/BoundKind";
import { BoundNumericLiteral } from "./Binding/BoundNumericLiteral";
import { BoundBinaryOperatorKind } from "./Binding/Kind/BoundBinaryOperatorKind";
import { UnaryExpression } from "./Parsing/UnaryExpression";
import { BoundUnaryExpression } from "./Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./Binding/Kind/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "./Parsing/ParenthesizedExpression";
import { BoundNode } from "./Binding/BoundNode";
import { BoundError } from "./Binding/BoundError";
import { Program } from "./Parsing/Program";
import { BoundStatement } from "./Binding/BoundStatement";
import { BoundProgram } from "./Binding/BoundProgram";
import { BoundScope } from "./Binding/BoundScope";
import { CellAssignment } from "./Parsing/CellAssignment";
import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { Cell } from "../Cell";
import { BoundCellAssignment } from "./Binding/BoundCellAssignment";
import { CompilerOptions } from "../CompilerOptions";
import { FunctionExpression } from "./Parsing/FunctionExpression";
import { BoundFunctionExpression } from "./Binding/BoundFunctionExpression";

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
