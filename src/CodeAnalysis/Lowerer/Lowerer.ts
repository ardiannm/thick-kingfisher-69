import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { BinaryExpression } from "../Parser/BinaryExpression";
import { DeclarationStatement } from "../Parser/DeclarationStatement";
import { Facts } from "../Parser/Facts";
import { ParenthesizedExpression } from "../Parser/ParenthesizedExpression";
import { Program } from "../Parser/Program";
import { SyntaxKind } from "../Parser/SyntaxKind";
import { SyntaxNode } from "../Parser/SyntaxNode";
import { SyntaxToken } from "../Parser/SyntaxToken";
import { UnaryExpression } from "../Parser/UnaryExpression";

export class Lowerer {
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Rewriter);

  Lower<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.Program:
        return this.LowerProgram(Node as NodeType<Program>);
      case SyntaxKind.BinaryExpression:
        return this.LowerBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.UnaryExpression:
        return this.LowerUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.LowerParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.ReferenceCell:
      case SyntaxKind.CloneCell:
        return this.LowerReferenceStatement(Node as NodeType<DeclarationStatement>);
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
      case SyntaxKind.RangeReference:
        return Node;
      default:
        this.Diagnostics.ReportMissingMethod(Node.Kind);
        return Node;
    }
  }

  private LowerProgram(Node: Program) {
    const Root = Node.Root.map((Statement) => this.Lower(Statement));
    return new Program(SyntaxKind.Program, Root, Node.EndOfFileToken);
  }

  private LowerReferenceStatement(Node: DeclarationStatement) {
    const Left = this.Lower(Node.Left);
    const Expression = this.Lower(Node.Expression);
    return new DeclarationStatement(SyntaxKind.ReferenceCell, Left, Node.Keyword, Expression);
  }

  private LowerBinaryExpression(Node: BinaryExpression) {
    const Left = this.Lower(Node.Left);
    const Right = this.Lower(Node.Right);
    const Rewritten = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Node.Operator, Right);
    const Flattened = this.FlattenBinaryExpression(Rewritten);
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return this.Simplify(Flattened);
    }
    return Flattened;
  }

  private FlattenBinaryExpression(Node: BinaryExpression) {
    if (Node.Right.Kind === SyntaxKind.BinaryExpression) {
      var Right = Node.Right as BinaryExpression;
      const Precedence = Facts.BinaryPrecedence(Right.Operator.Kind) === Facts.BinaryPrecedence(Node.Operator.Kind);
      if (Precedence) {
        if (Node.Operator.Kind === SyntaxKind.MinusToken) {
          Node.Operator = this.SwitchSign(Node.Operator);
          Right = this.SwitchSign(Node.Right) as BinaryExpression;
        }
        const Left = new BinaryExpression(SyntaxKind.BinaryExpression, Node.Left, Node.Operator, Right.Left);
        return new BinaryExpression(SyntaxKind.BinaryExpression, this.Lower(Left), Right.Operator, this.Lower(Right.Right));
      }
    }
    return Node;
  }

  private LowerUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return this.Lower(Node.Right);
      case SyntaxKind.MinusToken:
        return this.Simplify(this.SwitchSign(this.Lower(Node.Right)));
    }
    return Node;
  }

  private LowerParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Lower(Node.Expression);
  }

  private SwitchSign<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.UnaryExpression:
        return this.SwitchUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.SwitchParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.BinaryExpression:
        return this.SwitchBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.PlusToken:
        return new SyntaxToken(SyntaxKind.MinusToken, "-");
      case SyntaxKind.MinusToken:
        return new SyntaxToken(SyntaxKind.PlusToken, "+");
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
        return this.SwitchSyntaxNode(Node as NodeType<SyntaxNode>);
      default:
        throw this.Diagnostics.ReportSwitchOperatorMethod(Node.Kind);
    }
  }

  private SwitchParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.SwitchSign(Node.Expression);
  }

  private SwitchSyntaxNode(Node: SyntaxNode) {
    return new UnaryExpression(SyntaxKind.UnaryExpression, new SyntaxToken(SyntaxKind.MinusToken, "-"), Node);
  }

  private SwitchUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.MinusToken:
        return Node.Right;
      case SyntaxKind.PlusToken:
        return new UnaryExpression(SyntaxKind.UnaryExpression, this.SwitchSign(Node.Operator), Node.Right);
    }
    return Node;
  }

  private SwitchBinaryExpression(Node: BinaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
      case SyntaxKind.MinusToken:
        return new BinaryExpression(
          SyntaxKind.BinaryExpression,
          this.SwitchSign(Node.Left),
          Node.Operator,
          this.SwitchSign(Node.Right)
        );
    }
    return Node;
  }

  private Simplify<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.BinaryExpression:
        return this.SimplifyBinaryExpression(Node as NodeType<BinaryExpression>);
    }
    return Node;
  }

  private SimplifyBinaryExpression(Node: BinaryExpression) {
    if (Node.Right.Kind === SyntaxKind.UnaryExpression) {
      Node.Operator = this.SwitchSign(Node.Operator);
      Node.Right = this.Lower(this.SwitchSign(Node.Right));
    }
    return Node;
  }
}
