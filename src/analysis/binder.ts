import { Span } from "./text/span";
import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { SyntaxBinaryOperatorKind } from "./parser/kind/syntax.binary.operator.kind";
import { SyntaxUnaryOperatorKind } from "./parser/kind/syntax.unary.operator.kind";
import { SyntaxNode } from "./parser/syntax.node";
import { SyntaxBinaryExpression } from "./parser/syntax.binary.expression";
import { SyntaxToken } from "./parser/syntax.token";
import { BoundBinaryExpression } from "./binder/binary.expression";
import { BoundNumericLiteral } from "./binder/bound.numeric.literal";
import { BoundBinaryOperatorKind } from "./binder/kind/bound.binary.operator.kind";
import { SyntaxUnaryExpression } from "./parser/syntax.unary.expression";
import { BoundUnaryExpression } from "./binder/bound.unary.expression";
import { BoundUnaryOperatorKind } from "./binder/kind/bound.unary.operator.kind";
import { SyntaxParenthesis } from "./parser/syntax.parenthesis";
import { BoundNode } from "./binder/bound.node";
import { BoundErrorExpression } from "./binder/bound.error.expression";
import { SyntaxCompilationUnit } from "./parser/syntax.compilation.unit";
import { BoundCompilationUnit } from "./binder/bound.compilation.unit";
import { BoundStatement } from "./binder/bound.statement";
import { SyntaxBlock } from "./parser/syntax.block";
import { BoundBlock } from "./binder/bound.block";
import { BoundScope } from "./binder/bound.scope";
import { BoundKind } from "./binder/kind/bound.kind";
import { BoundExpression } from "./binder/bound.expression";
import { SyntaxCellReference } from "./parser/syntax.cell.reference";
import { SyntaxCellAssignment } from "./parser/syntax.cell.assignment";
import { SyntaxExpression } from "./parser/syntax.expression";

export class BoundCellReference extends BoundNode {
  constructor(public cell: BoundCell, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}

export class BoundCell extends BoundNode {
  public observers = new Map<string, BoundCell>();
  public stack = new Map<string, BoundCell>();
  constructor(public name: string, public expression: BoundExpression, public dependencies: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCell, span);
  }
}

export class BoundCellAssignment extends BoundNode {
  constructor(public assignee: BoundCell, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);
  }
}

export class Binder {
  public scope = new BoundScope(null);

  public bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case SyntaxNodeKind.SyntaxCompilationUnit:
        return this.bindSyntaxCompilationUnit(node as NodeType<SyntaxCompilationUnit>);
      case SyntaxNodeKind.NumberToken:
        return this.bindSyntaxNumber(node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.SyntaxParenthesis:
        return this.bindSyntaxParenthesizedExpression(node as NodeType<SyntaxParenthesis>);
      case SyntaxNodeKind.SyntaxUnaryExpression:
        return this.bindSyntaxUnaryExpression(node as NodeType<SyntaxUnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.bindSyntaxBinaryExpression(node as NodeType<SyntaxBinaryExpression>);
      case SyntaxNodeKind.SyntaxBlock:
        return this.bindSyntaxBlock(node as NodeType<SyntaxBlock>);
      case SyntaxNodeKind.SyntaxCellReference:
        return this.bindSyntaxCellReference(node as NodeType<SyntaxCellReference>);
      case SyntaxNodeKind.SyntaxCellAssignment:
        return this.bindSyntaxCellAssignment(node as NodeType<SyntaxCellAssignment>);
    }
    node.tree.diagnostics.binderMethod(node.kind, node.span);
    return new BoundErrorExpression(node.kind, node.span);
  }

  private bindSyntaxCellAssignment(node: SyntaxCellAssignment) {
    const name = node.left.text;
    const observers = new Map<string, BoundCell>();
    if (this.scope.assignments.has(name)) {
      const prevAssignment = this.scope.assignments.get(name) as BoundCell;
      prevAssignment.observers.forEach((o) => observers.set(o.name, o));
    }
    this.scope.references.length = 0;
    const assignee = this.bindSyntaxCell(node.left as SyntaxCellReference, node.expression);
    this.scope.assignments.set(name, assignee);
    this.scope.references = new Array();
    assignee.stack = observers;
    return new BoundCellAssignment(assignee, node.span);
  }

  private bindSyntaxCell(node: SyntaxCellReference, expression: SyntaxExpression) {
    const name = node.text;
    const boundExpression = this.bind(expression);
    const cell = new BoundCell(name, boundExpression, this.scope.references, node.span);
    this.scope.references.forEach((d) => d.cell.observers.set(cell.name, cell));
    return cell;
  }

  private bindSyntaxCellReference(node: SyntaxCellReference) {
    const name = node.text;
    let expression: BoundCell;
    if (this.scope.assignments.has(name)) {
      expression = this.scope.assignments.get(name) as BoundCell;
    } else {
      const number = new SyntaxToken<SyntaxNodeKind.NumberToken>(node.tree, SyntaxNodeKind.NumberToken, node.span);
      expression = this.bindSyntaxCell(node, number);
      node.tree.configuration.explicitDeclarations && node.tree.diagnostics.undeclaredCell(name, node.span);
    }
    const bound = new BoundCellReference(expression, node.span);
    this.scope.references.push(bound);
    return bound;
  }

  private bindSyntaxCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundStatement>();
    for (const statement of node.root) {
      statements.push(this.bind(statement));
    }
    return new BoundCompilationUnit(statements, node.span);
  }

  private bindSyntaxBlock(node: SyntaxBlock): BoundNode {
    const statements = new Array<BoundStatement>();
    for (const statement of node.statements) {
      statements.push(this.bind(statement));
    }
    return new BoundBlock(statements, node.span);
  }

  private bindSyntaxBinaryExpression(node: SyntaxBinaryExpression) {
    const left = this.bind(node.left);
    const operator = this.bindBinaryOperatorKind(node.operator.kind);
    const right = this.bind(node.right);
    return new BoundBinaryExpression(left, operator, right, node.span);
  }

  private bindBinaryOperatorKind(kind: SyntaxBinaryOperatorKind): BoundBinaryOperatorKind {
    switch (kind) {
      case SyntaxBinaryOperatorKind.PlusToken:
        return BoundBinaryOperatorKind.Addition;
      case SyntaxBinaryOperatorKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction;
      case SyntaxBinaryOperatorKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication;
      case SyntaxBinaryOperatorKind.SlashToken:
        return BoundBinaryOperatorKind.Division;
      case SyntaxBinaryOperatorKind.HatToken:
        return BoundBinaryOperatorKind.Exponentiation;
    }
  }

  private bindSyntaxUnaryExpression(node: SyntaxUnaryExpression) {
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

  private bindSyntaxParenthesizedExpression(node: SyntaxParenthesis) {
    return this.bind(node.expression);
  }

  private bindSyntaxNumber(node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const value = parseFloat(node.text);
    return new BoundNumericLiteral(value, node.span);
  }
}
