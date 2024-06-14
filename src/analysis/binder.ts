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
  scope = new BoundScope(null, this.configuration);
  constructor(private diagnostics: DiagnosticBag, public configuration: CompilerOptions) {}

  public Bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case SyntaxNodeKind.Program:
        return this.BindProgram(node as NodeType<Program>);
      case SyntaxNodeKind.NumberToken:
        return this.BindNumber(node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.CellReference:
        return this.BindCellReference(node as NodeType<CellReference>);
      case SyntaxNodeKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(node as NodeType<ParenthesizedExpression>);
      case SyntaxNodeKind.UnaryExpression:
        return this.BindUnaryExpression(node as NodeType<UnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.BindBinaryExpression(node as NodeType<BinaryExpression>);
      case SyntaxNodeKind.CellAssignment:
        return this.BindCellAssignment(node as NodeType<CellAssignment>);
      case SyntaxNodeKind.FunctionExpression:
        return this.BindFunctionExpression(node as NodeType<FunctionExpression>);
    }
    this.diagnostics.BinderMethod(node.kind);
    return new BoundError(BoundKind.Error, node.kind);
  }

  private BindFunctionExpression(node: FunctionExpression): BoundNode {
    const name = node.functionName.text;
    if (this.configuration.globalFunctionsOnly) if (this.scope.parent) this.diagnostics.GlobalFunctionDeclarationsOnly(name);
    if (this.scope.functions.has(name)) {
      this.diagnostics.FunctionAlreadyDefined(name);
      return new BoundError(BoundKind.Error, node.kind);
    }
    const newFunctionScope = new BoundScope(this.scope, this.configuration);
    this.scope = newFunctionScope;
    const statements = new Array<BoundStatement>();
    for (const statement of node.statements) statements.push(this.Bind(statement));
    this.scope = this.scope.parent as BoundScope;
    const boundNode = new BoundFunctionExpression(BoundKind.FunctionExpression, node.functionName.text, this.scope, statements);
    this.scope.functions.set(name, boundNode);
    return boundNode;
  }

  private BindProgram(node: Program) {
    const root = new Array<BoundStatement>();
    for (const statement of node.root) root.push(this.Bind(statement));
    this.scope.CheckDeclarations(this.diagnostics);
    return new BoundProgram(BoundKind.Program, root);
  }

  private BindCellAssignment(node: CellAssignment) {
    switch (node.left.kind) {
      case SyntaxNodeKind.CellReference:
        const subject = this.Bind(node.left) as Cell;
        const assignmentScope = new BoundScope(this.scope, this.configuration);
        this.scope = assignmentScope as BoundScope;
        subject.expression = this.Bind(node.expression);
        subject.ClearDependencies();
        for (const dep of this.scope.cells.values()) {
          subject.Track(dep);
          if (dep.declared) continue;
          if (this.configuration.autoDeclaration) {
            this.diagnostics.AutoDeclaredCell(dep, subject);
            dep.declared = true;
            this.scope.Move(dep);
          }
        }
        this.scope = this.scope.parent as BoundScope;
        subject.declared = true;
        subject.formula = node.expression.GetSpan().GetText();
        return new BoundCellAssignment(BoundKind.CellAssignment, subject);
    }
    this.diagnostics.CantUseAsAReference(node.left.kind);
    return new BoundNode(BoundKind.CellAssignment);
  }

  private BindBinaryExpression(node: BinaryExpression) {
    const left = this.Bind(node.left);
    const operator = this.BindBinaryOperatorKind(node.operator.kind);
    const right = this.Bind(node.right);
    return new BoundBinaryExpression(BoundKind.BinaryExpression, left, operator, right);
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

  private BindUnaryExpression(node: UnaryExpression) {
    const right = this.Bind(node.right);
    switch (node.operator.kind) {
      case UnaryOperatorKind.MinusToken:
      case UnaryOperatorKind.PlusToken:
        const operator = this.BindUnaryOperatorKind(node.operator.kind);
        return new BoundUnaryExpression(BoundKind.UnaryExpression, operator, right);
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
    return this.Bind(Node.expression);
  }

  private BindCellReference(node: CellReference) {
    if (this.configuration.compactCellNames && node.right.trivia.length) {
      this.diagnostics.WrongCellNameFormat(node.left.GetSpan().GetText() + node.right.GetSpan().GetText());
      return new BoundError(BoundKind.Error, node.kind);
    }
    const row = node.right.GetSpan().GetText();
    const column = node.left.GetSpan().GetText();
    const name = node.GetSpan().GetText();
    return this.scope.ConstructCell(name, row, column);
  }

  private BindNumber(node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const value = parseFloat(node.text);
    return new BoundNumericLiteral(BoundKind.NumericLiteral, value);
  }
}
