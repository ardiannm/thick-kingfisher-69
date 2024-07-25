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
import { CompilationUnit } from "./parser/compilation.unit";
import { BoundStatement } from "./binder/statement";
import { BoundCompilationUnit } from "./binder/compilation.unit";
import { Environment } from "./environment";
import { CellAssignment } from "./parser/cell.assignment";
import { BoundCellAssignment } from "./binder/cell.assignment";
import { CompilerOptions } from "../compiler.options";
import { FunctionExpression } from "./parser/function.expression";
import { BoundFunctionExpression } from "./binder/function.expression";
import { DiagnosticsBag } from "./diagnostics/diagnostics.bag";

export class Binder {
  public environment = new Environment(null, this.configuration);
  constructor(private diagnostics: DiagnosticsBag, public configuration: CompilerOptions) {}

  public bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case SyntaxNodeKind.CompilationUnit:
        return this.bindProgram(node as NodeType<CompilationUnit>);
      case SyntaxNodeKind.NumberToken:
        return this.bindNumber(node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.CellReference:
        return this.bindCellReference(node as NodeType<CellReference>);
      case SyntaxNodeKind.ParenthesizedExpression:
        return this.bindParenthesizedExpression(node as NodeType<ParenthesizedExpression>);
      case SyntaxNodeKind.UnaryExpression:
        return this.bindUnaryExpression(node as NodeType<UnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.bindBinaryExpression(node as NodeType<BinaryExpression>);
      case SyntaxNodeKind.CellAssignment:
        return this.bindCellAssignment(node as NodeType<CellAssignment>);
      case SyntaxNodeKind.FunctionExpression:
        return this.bindFunctionExpression(node as NodeType<FunctionExpression>);
    }
    this.diagnostics.binderMethod(node.kind);
    return new BoundError(node.kind);
  }

  private bindFunctionExpression(node: FunctionExpression): BoundNode {
    const name = node.functionName.getText();
    if (this.configuration.globalFunctionsOnly) if (this.environment.parent) this.diagnostics.globalFunctionDeclarationsOnly(name);
    if (this.environment.functions.has(name)) {
      this.diagnostics.functionAlreadyDefined(name);
      return new BoundError(node.kind);
    }
    const environment = new Environment(this.environment, this.configuration);
    this.environment = environment;
    const statements = new Array<BoundStatement>();
    for (const statement of node.statements) statements.push(this.bind(statement));
    this.environment = this.environment.parent as Environment;
    const boundNode = new BoundFunctionExpression(node.functionName.getText(), this.environment, statements);
    this.environment.functions.set(name, boundNode);
    return boundNode;
  }

  private bindProgram(node: CompilationUnit) {
    const root = new Array<BoundStatement>();
    for (const statement of node.root) root.push(this.bind(statement));
    if (this.configuration.autoDeclaration) this.inspectCellDeclarations();
    return new BoundCompilationUnit(root);
  }

  private inspectCellDeclarations() {
    for (const cell of this.environment.cells.values()) for (const dependency of cell.dependencies.values()) if (!dependency.declared) this.diagnostics.undeclaredCell(dependency.name);
  }

  private bindCellAssignment(node: CellAssignment) {
    switch (node.left.kind) {
      case SyntaxNodeKind.CellReference:
        var subject = this.bindCellReference(node.left as CellReference);
        const environment = new Environment(this.environment, this.configuration);
        this.environment = environment as Environment;
        const expression = this.bind(node.expression);
        if (subject instanceof BoundError) return subject;
        subject.expression = expression;
        subject.clearDependencies();
        for (const dependency of this.environment.cells.values()) {
          subject.track(dependency);
          if (dependency.declared) {
            if (subject.hasCircularDependecy()) this.diagnostics.circularDependency(subject);
            continue;
          }
          if (this.configuration.autoDeclaration && subject !== dependency) {
            dependency.declared = true;
            this.diagnostics.autoDeclaredCell(dependency, subject);
          } else {
            this.diagnostics.undeclaredCell(dependency.name);
            if (subject.hasCircularDependecy()) this.diagnostics.circularDependency(subject);
          }
          this.environment.transferToParent(dependency);
        }
        this.environment = this.environment.parent as Environment;
        subject.formula = node.expression.getText();
        subject.declared = true;
        return new BoundCellAssignment(subject);
    }
    this.diagnostics.cantUseAsAReference(node.left.kind);
    return new BoundNode(BoundKind.CellAssignment);
  }

  private bindBinaryExpression(node: BinaryExpression) {
    const left = this.bind(node.left);
    const operator = this.bindBinaryOperatorKind(node.operator.kind);
    const right = this.bind(node.right);
    return new BoundBinaryExpression(left, operator, right);
  }

  private bindBinaryOperatorKind(Kind: BinaryOperatorKind): BoundBinaryOperatorKind {
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

  private bindUnaryExpression(node: UnaryExpression) {
    const right = this.bind(node.right);
    switch (node.operator.kind) {
      case UnaryOperatorKind.MinusToken:
      case UnaryOperatorKind.PlusToken:
        const operator = this.bindUnaryOperatorKind(node.operator.kind);
        return new BoundUnaryExpression(operator, right);
    }
  }

  private bindUnaryOperatorKind(Kind: UnaryOperatorKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case UnaryOperatorKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case UnaryOperatorKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
  }

  private bindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.bind(Node.expression);
  }

  private bindCellReference(node: CellReference) {
    const row = node.right.getText();
    const column = node.left.getText();
    if (this.configuration.compactCellNames && node.right.hasTrivia()) {
      this.diagnostics.wrongCellNameFormat(column + row);
      return new BoundError(node.kind);
    }
    const name = node.getText();
    return this.environment.createCell(row, column, name);
  }

  private bindNumber(node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const value = parseFloat(node.getText());
    return new BoundNumericLiteral(value);
  }
}
