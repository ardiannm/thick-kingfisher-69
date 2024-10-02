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
import { SyntaxCellReference } from "./parser/syntax.cell.reference";
import { SyntaxCellAssignment } from "./parser/syntax.cell.assignment";
import { BoundExpression } from "./binder/bound.expression";

export class BoundCellReference extends BoundNode {
  constructor(public assignment: BoundCellAssignment, public override span: Span) {
    super(BoundKind.BoundCellReference, span);
  }
}

export class Cell {
  constructor(public name: string, public value: number) {}
}

export class BoundCellAssignment extends BoundNode {
  constructor(public scope: BoundScope, public reference: Cell, public expression: BoundExpression, public references: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    const previous = this.scope.assignments.get(this.reference.name);
    previous?.references.forEach((node) => previous.disconnect(node));

    this.references.forEach((node) => this.connect(node));
    this.scope.assignments.set(this.reference.name, this);
    this.scope.clearStack()
    this.scope.stack.push(new Array<BoundCellAssignment>(this));
  }

  private connect(node: BoundCellReference) {
    var observers: Set<BoundCellAssignment>;
    if (this.scope.observers.has(node.assignment.reference.name)) {
      observers = this.scope.observers.get(node.assignment.reference.name)!;
    } else {
      observers = new Set<BoundCellAssignment>();
      this.scope.observers.set(node.assignment.reference.name, observers);
    }
    observers.add(this);
  }

  private disconnect(node: BoundCellReference) {
    if (this.scope.observers.has(node.assignment.reference.name)) {
      const observersSet = this.scope.observers.get(node.assignment.reference.name)!;
      observersSet.delete(this);
      if (observersSet.size === 0) this.scope.observers.delete(node.assignment.reference.name);
    }
  }

  count() {
    return this.scope.observers.get(this.reference.name)?.size ?? 0;
  }

  stackObservers() {
    if (this.scope.observers.has(this.reference.name)) {
      const observers = this.scope.observers.get(this.reference.name)!;
      this.scope.stack.push([...observers.values()]);
    }
  }
}

export class Binder {
  public scope = new BoundScope(null);

  private bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
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

  private bindSyntaxCellReference(node: SyntaxCellReference) {
    const name = node.text;
    let assigment: BoundCellAssignment;
    if (this.scope.assignments.has(name)) {
      assigment = this.scope.assignments.get(name)!;
    } else {
      const number = new BoundNumericLiteral(0, node.span);
      const dependencies = new Array<BoundCellReference>();
      const value = this.bindCell(node);
      assigment = new BoundCellAssignment(this.scope, value, number, dependencies, node.span);
      if (node.tree.configuration.explicitDeclarations) node.tree.diagnostics.undeclaredCell(name, node.span);
    }
    const bound = new BoundCellReference(assigment, node.span);
    this.scope.references.push(bound);
    return bound;
  }

  bindSyntaxCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundStatement>();
    for (const statement of node.root) {
      statements.push(this.bind(statement));
    }
    this.scope.clearDependencies();
    return new BoundCompilationUnit(this.scope, statements, node.span);
  }

  private bindSyntaxBlock(node: SyntaxBlock): BoundNode {
    this.scope = new BoundScope(this.scope);
    const statements = new Array<BoundStatement>();
    for (const statement of node.statements) {
      statements.push(this.bind(statement));
    }
    this.scope = this.scope.parent!;
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
