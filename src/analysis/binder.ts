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
  observers = new Map<string, BoundCellAssignment>();
  dependencies = new Map<string, BoundCellAssignment>();

  constructor(public name: string, public version: number) {}

  clear() {
    this.dependencies.forEach((node) => node.target.observers.delete(this.name));
    this.dependencies.clear();
  }
}

export class BoundCellAssignment extends BoundNode {
  actions = new Map<string, BoundCellAssignment>();
  static stack = new Array<Object>();
  static version = 0;

  constructor(public scope: BoundScope, public target: Cell, public expression: BoundExpression, public references: Array<BoundCellReference>, public override span: Span) {
    super(BoundKind.BoundCellAssignment, span);

    BoundCellAssignment.version++;
    this.target.version++;

    if (scope.assignments.has(this.target.name)) {
      const prev = scope.assignments.get(this.target.name)!;
      prev.target.clear();
    }

    references.forEach((node) => this.registerDependency(node));

    if (this.target.observers.size) {
      this.saveActions();
    }

    scope.assignments.set(this.target.name, this);

    const x = this.scope.report(this);
    BoundCellAssignment.stack.push(x);
  }

  public report() {
    const r = this.references.map((node) => node.assignment.target.name);
    const o = [...this.target.observers.values()].map((node) => node.target.name);
    const a = [...this.actions.values()].map((node) => node.target.name);

    const data = {
      name: this.target.name,
      version: this.target.version,
      line: this.span.line,
      dependencies: r,
      observers: o,
      actions: a,
    };

    return data;
  }

  private registerDependency(node: BoundCellReference) {
    this.target.dependencies.set(node.assignment.target.name, node.assignment);
    node.assignment.target.observers.set(this.target.name, this);
  }

  private saveActions() {
    const stack = new Array<BoundCellAssignment>(this);

    const memo = new Array<Object>();
    let iteration = 0;

    while (stack.length > 0) {
      iteration++;
      const struct = stack.map((node) => node.report());
      const node = stack.pop()!;
      memo.push({ iteration, "number of nodes in the stack": struct.length, "processing node": node.target.name, stack: struct, version: node.target.version });
      memo.push({ message: `last node is "${node.target.name}", popping it out of the stack` });

      // Check if the node has observers
      if (node.target.observers.size) {
        memo.push({ message: "observers found now iterating through them" });
        node.target.observers.forEach((observer) => {
          if (node.target.version > observer.target.version) {
            observer.target.version = node.target.version;
            memo.push({ message: `pushing "${observer.target.name}" to the stack` });
            stack.push(observer);
          } else {
            memo.push({ message: `node "${observer.target.name}" has been checked, skipping this node` });
            observer.actions.forEach((a) => this.actions.set(a.target.name, a)); // making sure that in case that this node has already been checked then at least its actions are being inherited without walking up the observer tree
            memo.push({ message: `using actions from node "${observer.target.name}"` });
          }
        });
      } else {
        memo.push({ message: `found no further observers in "${node.target.name}", saving "${node.target.name}" to actions` });
        // If no observers, just register the action
        this.actions.set(node.target.name, node);
      }
    }

    console.log(
      JSON.stringify({
        assigning: this.report(),
        stack: memo,
      })
    );
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
      return this.scope.assignments.get(name)!.target;
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
      const reference = this.bindCell(node);
      assigment = new BoundCellAssignment(this.scope, reference, number, dependencies, node.span);
      if (node.tree.configuration.explicitDeclarations) node.tree.diagnostics.undeclaredCell(name, node.span);
    }
    const bound = new BoundCellReference(assigment, node.span);
    this.scope.references.push(bound);
    return bound;
  }

  private bindSyntaxCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundStatement>();
    for (const statement of node.root) {
      statements.push(this.bind(statement));
    }
    console.log(JSON.stringify(BoundCellAssignment.stack));
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
