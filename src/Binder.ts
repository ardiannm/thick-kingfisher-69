import { DiagnosticBag } from "./CodeAnalysis/Diagnostics/DiagnosticBag";
import { SyntaxKind } from "./CodeAnalysis/Syntax/SyntaxKind";
import { SyntaxNode } from "./CodeAnalysis/Syntax/SyntaxNode";
import { DeclarationStatement } from "./CodeAnalysis/Syntax/DeclarationStatement";
import { BinaryExpression } from "./CodeAnalysis/Syntax/BinaryExpression";
import { RangeReference } from "./CodeAnalysis/Syntax/RangeReference";
import { CellReference } from "./CodeAnalysis/Syntax/CellReference";
import { SyntaxToken } from "./CodeAnalysis/Syntax/SyntaxToken";
import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundIdentifier } from "./CodeAnalysis/Binding/BoundIdentifier";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundRangeReference } from "./CodeAnalysis/Binding/BoundRangeReference";
import { BoundCell } from "./CodeAnalysis/Binding/BoundCell";
import { BoundRoot } from "./CodeAnalysis/Binding/BoundRoot";
import { HasReference } from "./CodeAnalysis/Binding/HasReference";
import { UnaryExpression } from "./CodeAnalysis/Syntax/UnaryExpression";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";
import { ParenthesizedExpression } from "./CodeAnalysis/Syntax/ParenthesizedExpression";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { Environment } from "./Environment";
import { BoundExpression } from "./CodeAnalysis/Binding/BoundExpression";
import { CopyCell } from "./CodeAnalysis/Syntax/CopyCell";
import { SyntaxRoot } from "./CodeAnalysis/Syntax/SyntaxRoot";

export class Binder {
  private Diagnostics: DiagnosticBag = new DiagnosticBag();
  constructor(public Env: Environment) {}

  Bind<Kind extends SyntaxNode>(Node: Kind): BoundNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.SyntaxRoot:
        return this.BindSyntaxRoot(Node as NodeType<SyntaxRoot>);
      case SyntaxKind.IdentifierToken:
        return this.BindIdentifier(Node as NodeType<SyntaxToken>);
      case SyntaxKind.NumberToken:
        return this.BindNumber(Node as NodeType<SyntaxToken>);
      case SyntaxKind.CellReference:
        return this.BindCellReference(Node as NodeType<CellReference>);
      case SyntaxKind.RangeReference:
        return this.BindRangeReference(Node as NodeType<RangeReference>);
      case SyntaxKind.ParenthesizedExpression:
        return this.BindParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.UnaryExpression:
        return this.BindUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.BinaryExpression:
        return this.BindBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.Declaration:
        return this.BindDeclarationStatement(Node as NodeType<DeclarationStatement>);
      case SyntaxKind.CopyCell:
        return this.BindCopyCell(Node as NodeType<CopyCell>);
      default:
        throw this.Diagnostics.MissingBindingMethod(Node.Kind);
    }
  }

  private BindCopyCell(Node: CopyCell) {
    if (Node.Left.Kind !== SyntaxKind.CellReference || Node.Right.Kind !== SyntaxKind.CellReference) {
      throw this.Diagnostics.CantCopyNode(Node.Left.Kind, Node.Right.Kind);
    }
    const Left = this.Bind(Node.Left) as BoundCellReference;
    const Right = this.Bind(Node.Right) as BoundCellReference;
    this.Env.Assert(Right.Reference);

    /**
     * in case of 'A7 copy A4'
     * got to A4 in the environment and get the bound expression of this cell
     * traverse the bound expression of this cell and modify all the expression dependencies to account for the relative change in positioning due to copying
     * alternatively go to 'A4' and get the string representation of the bound expression
     * tokenize it with recursive decent parsing enough to extract parse cell values and modify the reference when the token kind is a cell reference
     * the string representation apparoach ensures it keeps the original white spaces and other trivias
     * question is how to you modify cell reference dependencies without losing white spaces and other trivia
     */

    const Bound = new BoundCell(BoundKind.BoundCell, Left.Reference, new Set([Right.Reference]), new Set<string>(), Right);
    return this.Env.Declare(Bound);
  }

  private BindDeclarationStatement(Node: DeclarationStatement) {
    switch (Node.Left.Kind) {
      case SyntaxKind.CellReference:
        const Left = this.Bind(Node.Left) as BoundCellReference;
        const Scope = new Binder(new Environment());
        const Expression = Scope.Bind(Node.Expression);
        const Bound = new BoundCell(BoundKind.BoundCell, Left.Reference, Scope.Env.Stack, new Set<string>(), Expression);
        return this.Env.Declare(Bound);
      default:
        throw this.Diagnostics.CantUseAsAReference(Node.Left.Kind);
    }
  }

  private BindBinaryExpression(Node: BinaryExpression) {
    const Left = this.Bind(Node.Left);
    const Operator = this.BindOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundBinaryExpression(BoundKind.BoundBinaryExpression, Left, Operator, Right);
  }

  private BindOperatorKind(Kind: SyntaxKind): BoundBinaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundBinaryOperatorKind.Addition;
      case SyntaxKind.MinusToken:
        return BoundBinaryOperatorKind.Subtraction;
      case SyntaxKind.StarToken:
        return BoundBinaryOperatorKind.Multiplication;
      case SyntaxKind.SlashToken:
        return BoundBinaryOperatorKind.Division;
      default:
        throw this.Diagnostics.MissingOperatorKind(Kind);
    }
  }

  private BindUnaryExpression(Node: UnaryExpression) {
    const Operator = this.BindUnaryOperatorKind(Node.Operator.Kind);
    const Right = this.Bind(Node.Right);
    return new BoundUnaryExpression(BoundKind.BoundUnaryExpression, Operator, Right);
  }

  private BindUnaryOperatorKind(Kind: SyntaxKind): BoundUnaryOperatorKind {
    switch (Kind) {
      case SyntaxKind.PlusToken:
        return BoundUnaryOperatorKind.Identity;
      case SyntaxKind.MinusToken:
        return BoundUnaryOperatorKind.Negation;
      default:
        throw this.Diagnostics.MissingOperatorKind(Kind);
    }
  }

  private BindParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Bind(Node.Expression);
  }

  private BindRangeReference(Node: RangeReference) {
    const BoundLeft = this.Bind(Node.Left) as HasReference;
    const BoundRight = this.Bind(Node.Right) as HasReference;
    return new BoundRangeReference(BoundKind.BoundRangeReference, BoundLeft.Reference + ":" + BoundRight.Reference);
  }

  private BindCellReference(Node: CellReference) {
    const Reference = Node.Left.Text + Node.Right.Text;
    const Bound = new BoundCellReference(BoundKind.BoundCellReference, Reference);
    this.Env.ReferToCell(Bound);
    return Bound;
  }

  private BindIdentifier(Node: SyntaxToken) {
    return new BoundIdentifier(BoundKind.BoundIdentifier, Node.Text, Node.Text);
  }

  private BindNumber(Node: SyntaxToken) {
    const Value = parseFloat(Node.Text);
    return new BoundNumber(BoundKind.BoundNumber, Node.Text, Value);
  }

  private BindSyntaxRoot(Node: SyntaxRoot) {
    const Expressions = new Array<BoundExpression>();
    for (const Expression of Node.Expressions) {
      const BoundExpression = this.Bind(Expression);
      switch (BoundExpression.Kind) {
        case BoundKind.BoundCellReference:
          this.Env.Assert((BoundExpression as BoundCellReference).Reference);
      }
      Expressions.push(BoundExpression);
    }
    return new BoundRoot(BoundKind.BoundRoot, Expressions);
  }
}
