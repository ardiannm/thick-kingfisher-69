import { SyntaxNodeKind } from "./parser/kind/syntax.node.kind";
import { BinaryOperatorKind } from "./parser/kind/binary.operator.kind";
import { SyntaxUnaryOperatorKind } from "./parser/kind/syntax.unary.operator.kind";
import { SyntaxNode } from "./parser/syntax.node";
import { SyntaxBinaryExpression } from "./parser/syntax.binary.expression";
import { SyntaxCellReference } from "./parser/syntax.cell.reference";
import { SyntaxToken } from "./parser/syntax.token";
import { BoundBinaryExpression } from "./binder/binary.expression";
import { BoundNumericLiteral } from "./binder/numeric.literal";
import { BoundBinaryOperatorKind } from "./binder/kind/binary.operator.kind";
import { UnaryExpression } from "./parser/unary.expression";
import { BoundUnaryExpression } from "./binder/unary.expression";
import { BoundUnaryOperatorKind } from "./binder/kind/unary.operator.kind";
import { SyntaxParenthesis } from "./parser/syntax.parenthesis";
import { BoundNode } from "./binder/bound.node";
import { BoundErrorExpression } from "./binder/error.expression";
import { SyntaxCompilationUnit } from "./parser/syntax.compilation.unit";
import { BoundCompilationUnit } from "./binder/compilation.unit";
import { SyntaxCellAssignment } from "./parser/syntax.cell.assignment";
import { CompilerOptions } from "../compiler.options";
import { DiagnosticsBag } from "./diagnostics/diagnostics.bag";
import { Cell } from "../runtime/cell";
import { BoundCellAssignment } from "./binder/cell.assignment";
import { BoundCellReference } from "./binder/cell.reference";
import { BoundKind } from "./binder/kind/bound.kind";
import { BoundStatement } from "./binder/statement";
import { SyntaxBlock } from "./parser/syntax.block";
import { BoundBlock } from "./binder/bound.block";

class BoundScope extends BoundNode {
  private references = new Array<BoundCellReference>();
  private declared = new Map<string, Cell>();

  constructor(public parent: BoundScope | null) {
    super(BoundKind.BoundScope);
  }

  createCell(name: string): Cell {
    if (this.declared.has(name)) {
      // console.log(name, "already exists");
      return this.declared.get(name) as Cell;
    }
    // console.log(name, "created");
    return Cell.createFrom(name);
  }

  clearStack() {
    this.references.length = 0;
  }

  hasMore() {
    return this.references.length;
  }

  nextReference() {
    return this.references.shift() as BoundCellReference;
  }

  registerReference(reference: BoundCellReference) {
    this.references.push(reference);
  }

  declareCell(cell: Cell) {
    this.declared.set(cell.name, cell);
  }

  isDeclared(cell: string) {
    return this.declared.has(cell);
  }
}

export class Binder {
  scope = new BoundScope(null);
  constructor(private diagnosticsBag: DiagnosticsBag, public configuration: CompilerOptions) {}

  public bind<Kind extends SyntaxNode>(node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (node.kind) {
      case SyntaxNodeKind.SyntaxCompilationUnit:
        return this.bindSyntaxCompilationUnit(node as NodeType<SyntaxCompilationUnit>);
      case SyntaxNodeKind.NumberToken:
        return this.bindSyntaxNumber(node as NodeType<SyntaxToken<SyntaxNodeKind.NumberToken>>);
      case SyntaxNodeKind.SyntaxCellReference:
        return this.bindSyntaxCellReference(node as NodeType<SyntaxCellReference>);
      case SyntaxNodeKind.SyntaxParenthesis:
        return this.bindSyntaxParenthesizedExpression(node as NodeType<SyntaxParenthesis>);
      case SyntaxNodeKind.SyntaxUnaryExpression:
        return this.bindSyntaxUnaryExpression(node as NodeType<UnaryExpression>);
      case SyntaxNodeKind.BinaryExpression:
        return this.bindSyntaxBinaryExpression(node as NodeType<SyntaxBinaryExpression>);
      case SyntaxNodeKind.SyntaxCellAssignment:
        return this.bindSyntaxCellAssignment(node as NodeType<SyntaxCellAssignment>);
      case SyntaxNodeKind.SyntaxBlock:
        return this.bindSyntaxBlock(node as NodeType<SyntaxBlock>);
    }
    this.diagnosticsBag.binderMethod(node.kind, node.span);
    return new BoundErrorExpression(node.kind);
  }
  private bindSyntaxCompilationUnit(node: SyntaxCompilationUnit) {
    const statements = new Array<BoundStatement>();
    for (const statement of node.root) statements.push(this.bind(statement));
    return new BoundCompilationUnit(statements);
  }

  private bindSyntaxBlock(node: SyntaxBlock): BoundNode {
    const statements = new Array<BoundStatement>();
    for (const statement of node.statements) statements.push(this.bind(statement));
    return new BoundBlock(statements);
  }

  private bindSyntaxCellAssignment(node: SyntaxCellAssignment) {
    switch (node.left.kind) {
      case SyntaxNodeKind.SyntaxCellReference:
        const left = this.bindSyntaxCellReference(node.left as SyntaxCellReference);
        this.scope.clearStack();
        const expression = this.bind(node.expression);
        left.expression = expression;
        left.clearDependencies();
        while (this.scope.hasMore()) {
          const bound = this.scope.nextReference();
          left.track(bound.reference);
          if (bound.reference.doesReference(left)) {
            this.diagnosticsBag.circularDependency(left.name, bound.reference.name, bound.span);
          }
          if (this.scope.isDeclared(bound.reference.name)) continue;
          if (left.name === bound.reference.name) {
            this.diagnosticsBag.usginBeforeDeclaration(bound.reference.name, bound.span);
          } else {
            this.diagnosticsBag.undeclaredCell(bound.reference.name, bound.span);
          }
        }
        this.scope.declareCell(left);
        this.scope.clearStack();
        return new BoundCellAssignment(left, expression);
    }
    this.diagnosticsBag.cantUseAsAReference(node.left.kind, node.left.span);
    this.bind(node.expression);
    return new BoundErrorExpression(node.kind);
  }

  private bindSyntaxBinaryExpression(node: SyntaxBinaryExpression) {
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

  private bindSyntaxUnaryExpression(node: UnaryExpression) {
    const right = this.bind(node.right);
    switch (node.operator.kind) {
      case SyntaxUnaryOperatorKind.MinusToken:
      case SyntaxUnaryOperatorKind.PlusToken:
        const operator = this.bindUnaryOperatorKind(node.operator.kind);
        return new BoundUnaryExpression(operator, right);
    }
  }

  private bindUnaryOperatorKind(Kind: SyntaxUnaryOperatorKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case SyntaxUnaryOperatorKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxUnaryOperatorKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
    }
  }

  private bindSyntaxParenthesizedExpression(Node: SyntaxParenthesis) {
    return this.bind(Node.expression);
  }

  private bindSyntaxCellReference(node: SyntaxCellReference) {
    const name = node.text;
    const cell = this.scope.createCell(name);
    const bound = new BoundCellReference(cell, node.span);
    this.scope.registerReference(bound);
    return cell;
  }

  private bindSyntaxNumber(node: SyntaxToken<SyntaxNodeKind.NumberToken>) {
    const value = parseFloat(node.text);
    return new BoundNumericLiteral(value);
  }
}
