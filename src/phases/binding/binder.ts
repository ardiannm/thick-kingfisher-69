import { Cell } from "../evaluating/cell"
import { SyntaxBinaryOperatorKind, SyntaxKind, SyntaxUnaryOperatorKind } from "../parsing/syntax.kind"
import { SyntaxCellAssignment } from "../parsing/syntax.cell.assignment"
import { SyntaxCellReference } from "../parsing/syntax.cell.reference"
import { SyntaxCompilationUnit } from "../parsing/syntax.compilation.unit"
import { SyntaxNode } from "../parsing/syntax.node"
import { SyntaxParenthesis } from "../parsing/syntax.parenthesis"
import { SyntaxToken } from "../lexing/syntax.token"
import { SyntaxUnaryExpression } from "../parsing/syntax.unary.expression"
import { BoundCellAssignment } from "./bound.cell.assignment"
import { BoundCellReference } from "./bound.cell.reference"
import { BoundCompilationUnit } from "./bound.compilation.unit"
import { BoundSyntaxError } from "./bound.syntax.error"
import { BoundNode } from "./bound.node"
import { BoundNumericLiteral } from "./bound.numeric.literal"
import { BoundScope } from "./bound.scope"
import { BoundUnaryExpression } from "./bound.unary.expression"
import { BoundBinaryOperatorKind, BoundUnaryOperatorKind } from "./bound.kind"
import { SyntaxBinaryExpression } from "../parsing/syntax.binary.expression"
import { BoundBinaryExpression } from "./bound.binary.expression"
import { Span } from "../lexing/span"

export class Binder {
  private constructor(private scope: BoundScope) {}

  static bindCompilationUnit(node: SyntaxCompilationUnit) {
    return new Binder(new BoundScope(node.source.diagnostics)).bindCompilationUnit(node)
  }

  private bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    switch (node.kind) {
      case SyntaxKind.SyntaxCompilationUnit:
        return this.bindCompilationUnit(node as Kind & SyntaxCompilationUnit)
      case SyntaxKind.NumberToken:
        return this.bindNumber(node as Kind & SyntaxToken<SyntaxKind.NumberToken>)
      case SyntaxKind.SyntaxParenthesis:
        return this.bindParenthesizedExpression(node as Kind & SyntaxParenthesis)
      case SyntaxKind.SyntaxUnaryExpression:
        return this.bindUnaryExpression(node as Kind & SyntaxUnaryExpression)
      case SyntaxKind.SyntaxBinaryExpression:
        return this.bindBinaryExpression(node as Kind & SyntaxBinaryExpression)
      case SyntaxKind.SyntaxCellReference:
        return this.bindCellReference(node as Kind & SyntaxCellReference)
      case SyntaxKind.SyntaxCellAssignment:
        return this.bindCellAssignment(node as Kind & SyntaxCellAssignment)
      case SyntaxKind.SyntaxError:
        return new BoundSyntaxError(node.kind, node.span)
      default:
        this.scope.diagnostics.reportMissingBinderMethod(node.kind, node.span)
        return new BoundSyntaxError(node.kind, node.span)
    }
  }

  private bindCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundNode>()
    for (const statement of node.statements) {
      statements.push(this.bind(statement))
    }
    return new BoundCompilationUnit(this.scope, statements, node.span)
  }

  private bindCellAssignment(node: SyntaxCellAssignment) {
    if (node.left.kind === SyntaxKind.SyntaxCellReference) {
      this.scope.references.length = 0
      const expression = this.bind(node.expression)
      const reference = this.bindCell(node.left)
      const bound = new BoundCellAssignment(this.scope, reference, expression, this.scope.references, node.span)
      this.scope.references = new Array<BoundCellReference>()
      return bound
    } else {
      if (node.left.kind === SyntaxKind.SyntaxError) {
        this.bind(node.left)
        const span = Span.createFrom(node.source, node.left.span.start, node.operator.span.end)
        this.scope.diagnostics.reportCantAssignTo(node.left.kind, span)
      }
      this.bind(node.expression)
      return new BoundSyntaxError(node.kind, node.span)
    }
  }

  private bindCell(node: SyntaxCellReference): Cell {
    const name = node.name
    if (this.scope.assignments.has(name)) {
      return this.scope.assignments.get(name)!.cell
    }
    return new Cell(name, 0, false)
  }

  private bindCellReference(node: SyntaxCellReference) {
    const name = node.name
    let assigment: BoundCellAssignment
    if (this.scope.assignments.has(name)) {
      assigment = this.scope.assignments.get(name)!
    } else {
      const number = new BoundNumericLiteral(0, node.span)
      const dependencies = new Array<BoundCellReference>()
      const value = this.bindCell(node)
      assigment = new BoundCellAssignment(this.scope, value, number, dependencies, node.span)
      this.scope.diagnostics.reportUndeclaredCell(name, node.span)
    }
    const bound = new BoundCellReference(assigment, node.span)
    this.scope.references.push(bound)
    return bound
  }

  private bindUnaryExpression(node: SyntaxUnaryExpression) {
    const right = this.bind(node.right)
    switch (node.operator.kind) {
      case SyntaxKind.MinusToken:
      case SyntaxKind.PlusToken:
        const operator = this.bindUnaryOperatorKind(node.operator.kind)
        return new BoundUnaryExpression(operator, right, node.span)
    }
  }

  private bindBinaryExpression(node: SyntaxBinaryExpression) {
    const left = this.bind(node.left)
    const operator = this.bindBinaryOperatorKind(node.operator.kind)
    const right = this.bind(node.right)
    return new BoundBinaryExpression(left, operator, right, node.span)
  }

  private bindUnaryOperatorKind(kind: SyntaxUnaryOperatorKind): BoundUnaryOperatorKind {
    switch (kind) {
      case SyntaxKind.PlusToken:
        return BoundUnaryOperatorKind.Identity
      case SyntaxKind.MinusToken:
        return BoundUnaryOperatorKind.Negation
    }
  }

  private bindBinaryOperatorKind(kind: SyntaxBinaryOperatorKind): BoundBinaryOperatorKind {
    switch (kind) {
      case SyntaxKind.PlusToken:
        return BoundBinaryOperatorKind.Addition
      case SyntaxKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction
      case SyntaxKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication
      case SyntaxKind.SlashToken:
        return BoundBinaryOperatorKind.Division
      case SyntaxKind.HatToken:
        return BoundBinaryOperatorKind.Exponentiation
    }
  }

  private bindParenthesizedExpression(node: SyntaxParenthesis) {
    return this.bind(node.expression)
  }

  private bindNumber(node: SyntaxToken<SyntaxKind.NumberToken>) {
    const value = parseFloat(node.span.text)
    return new BoundNumericLiteral(value, node.span)
  }
}
