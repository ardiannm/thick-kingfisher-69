import { Cell } from "../../cell";
import { CompilerOptions } from "../../syntax.tree";
import { DiagnosticsBag } from "../diagnostics/diagnostics.bag";
import { SyntaxKind, SyntaxUnaryOperatorKind } from "../parsing/syntax.kind";
import { SyntaxBlock } from "../parsing/syntax.block";
import { SyntaxCellAssignment } from "../parsing/syntax.cell.assignment";
import { SyntaxCellReference } from "../parsing/syntax.cell.reference";
import { SyntaxCompilationUnit } from "../parsing/syntax.compilation.unit";
import { SyntaxNode } from "../parsing/syntax.node";
import { SyntaxParenthesis } from "../parsing/syntax.parenthesis";
import { SyntaxToken } from "../parsing/syntax.token";
import { SyntaxUnaryExpression } from "../parsing/syntax.unary.expression";
import { BoundBlock } from "./bound.block";
import { BoundCellAssignment } from "./bound.cell.assignment";
import { BoundCellReference } from "./bound.cell.reference";
import { BoundCompilationUnit } from "./bound.compilation.unit";
import { BoundErrorExpression } from "./bound.error.expression";
import { BoundNode } from "./bound.node";
import { BoundNumericLiteral } from "./bound.numeric.literal";
import { BoundScope } from "./bound.scope";
import { BoundUnaryExpression } from "./bound.unary.expression";
import { BoundUnaryOperatorKind } from "./bound.kind";

export class Binder {
  private constructor(private configuration: CompilerOptions, private diagnostics: DiagnosticsBag, private scope = new BoundScope()) {}

  private bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case SyntaxKind.SyntaxCompilationUnit:
        return this.bindCompilationUnit(node as NodeType<SyntaxCompilationUnit>);
      case SyntaxKind.NumberToken:
        return this.bindNumber(node as NodeType<SyntaxToken<SyntaxKind.NumberToken>>);
      case SyntaxKind.SyntaxParenthesis:
        return this.bindParenthesizedExpression(node as NodeType<SyntaxParenthesis>);
      case SyntaxKind.SyntaxUnaryExpression:
        return this.bindUnaryExpression(node as NodeType<SyntaxUnaryExpression>);
      case SyntaxKind.SyntaxBlock:
        return this.bindBlock(node as NodeType<SyntaxBlock>);
      case SyntaxKind.SyntaxCellReference:
        return this.bindCellReference(node as NodeType<SyntaxCellReference>);
      case SyntaxKind.SyntaxCellAssignment:
        return this.bindCellAssignment(node as NodeType<SyntaxCellAssignment>);
    }
    this.diagnostics.binderMethod(node.kind, node.span);
    return new BoundErrorExpression(node.kind, node.span);
  }

  static bindCompilationUnit(node: SyntaxCompilationUnit, diagnostics: DiagnosticsBag, configuration: CompilerOptions) {
    return new Binder(configuration, diagnostics).bindCompilationUnit(node);
  }

  private bindCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundNode>();
    for (const statement of node.root) {
      statements.push(this.bind(statement));
    }
    return new BoundCompilationUnit(this.scope, statements, node.span);
  }

  private bindBlock(node: SyntaxBlock): BoundNode {
    this.scope = new BoundScope(this.scope);
    const statements = new Array<BoundNode>();
    for (const statement of node.statements) {
      statements.push(this.bind(statement));
    }
    this.scope = this.scope.parent!;
    return new BoundBlock(statements, node.span);
  }

  private bindCellAssignment(node: SyntaxCellAssignment) {
    this.scope.references.length = 0;
    const expression = this.bind(node.expression);
    const reference = this.bindCell(node.left as SyntaxCellReference);
    const bound = new BoundCellAssignment(this.scope, reference, expression, this.scope.references, node.span);
    this.scope.references = new Array<BoundCellReference>();
    return bound;
  }

  private bindCell(node: SyntaxCellReference): Cell {
    const name = node.text;
    if (this.scope.assignments.has(name)) {
      return this.scope.assignments.get(name)!.reference;
    }
    return new Cell(name, 0);
  }

  private bindCellReference(node: SyntaxCellReference) {
    const name = node.text;
    let assigment: BoundCellAssignment;
    if (this.scope.assignments.has(name)) {
      assigment = this.scope.assignments.get(name)!;
    } else {
      const number = new BoundNumericLiteral(0, node.span);
      const dependencies = new Array<BoundCellReference>();
      const value = this.bindCell(node);
      assigment = new BoundCellAssignment(this.scope, value, number, dependencies, node.span);
      if (this.configuration.explicitDeclarations && !node.right.hasTrivia()) this.diagnostics.undeclaredCell(name, node.span);
    }
    const bound = new BoundCellReference(assigment, node.span);
    this.scope.references.push(bound);
    return bound;
  }

  private bindUnaryExpression(node: SyntaxUnaryExpression) {
    const right = this.bind(node.right);
    switch (node.operator.kind) {
      case SyntaxUnaryOperatorKind.MinusToken:
      case SyntaxUnaryOperatorKind.PlusToken:
        const operator = this.bindUnaryOperatorKind(node.operator.kind);
        return new BoundUnaryExpression(operator, right, node.span);
    }
  }

  private bindUnaryOperatorKind(kind: SyntaxUnaryOperatorKind): BoundUnaryOperatorKind {
    switch (kind) {
      case SyntaxUnaryOperatorKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxUnaryOperatorKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
  }

  private bindParenthesizedExpression(node: SyntaxParenthesis) {
    return this.bind(node.expression);
  }

  private bindNumber(node: SyntaxToken<SyntaxKind.NumberToken>) {
    const value = parseFloat(node.text);
    return new BoundNumericLiteral(value, node.span);
  }
}
