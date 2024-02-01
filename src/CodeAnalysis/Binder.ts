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
import { CompilerOptions } from "../CompilerOptions/CompilerOptions";

export class Binder {
  public Scope = new BoundScope(null);
  constructor(private Diagnostics: DiagnosticBag, public CompilerOptions: CompilerOptions) {}

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
    }
    this.Diagnostics.BinderMethod(Node.Kind);
    return new BoundError(BoundKind.Error, Node.Kind);
  }

  private BindProgram(Node: Program) {
    const Root = new Array<BoundStatement>();
    for (const Member of Node.Root) Root.push(this.Bind(Member));
    this.Scope.CheckDeclarations(this.Diagnostics);
    return new BoundProgram(BoundKind.Program, Root);
  }

  private BindCellAssignment(Node: CellAssignment) {
    switch (Node.Left.Kind) {
      case SyntaxNodeKind.CellReference:
        const Cell = this.Bind(Node.Left) as Cell;
        const AssignmentScope = new BoundScope(this.Scope);
        this.Scope = AssignmentScope as BoundScope;
        Cell.Expression = this.Bind(Node.Expression);
        Cell.ClearSubjects();
        for (const Subject of this.Scope.GetCells()) {
          Cell.Watch(Subject);
          if (Subject.Declared) continue;
          if (this.CompilerOptions.AutoDeclaration) {
            this.Diagnostics.AutoDeclaredCell(Subject, Cell);
            Subject.Declared = true;
            this.Scope.Move(Subject);
          }
        }
        this.Scope = this.Scope.ParentScope as BoundScope;
        Cell.Declared = true;
        Cell.Formula = Node.Expression.TextSpan().Get();
        return new BoundCellAssignment(BoundKind.CellAssignment, Cell);
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
    const Name = Node.TextSpan().Get();
    if (this.CompilerOptions.CompactCellNames && Node.Right.Trivia.length) {
      this.Diagnostics.WrongCellNameFormat(Node.Left.TextSpan().Get() + Node.Right.TextSpan().Get());
      return new BoundError(BoundKind.Error, Node.Kind);
    }
    return this.Scope.ConstructCell(Name);
  }

  private BindNumber(Node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const Value = parseFloat(Node.Text);
    return new BoundNumericLiteral(BoundKind.NumericLiteral, Value);
  }
}
