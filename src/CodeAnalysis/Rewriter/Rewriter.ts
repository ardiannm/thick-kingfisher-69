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

export class Rewriter {
  private Diagnostics = new DiagnosticBag(DiagnosticKind.Rewriter);

  Rewrite<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.Program:
        return this.RewriteProgram(Node as NodeType<Program>);
      case SyntaxKind.BinaryExpression:
        return this.RewriteBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.UnaryExpression:
        return this.RewriteUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.RewriteParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.ReferenceStatement:
        return this.RewriteReferenceStatement(Node as NodeType<DeclarationStatement>);
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
        return Node;
      default:
        throw this.Diagnostics.MissingMethod(Node.Kind);
    }
  }

  private RewriteProgram(Node: Program) {
    const Root = Node.Root.map((Statement) => this.Rewrite(Statement));
    return new Program(SyntaxKind.Program, Root);
  }

  private RewriteReferenceStatement(Node: DeclarationStatement) {
    const Left = this.Rewrite(Node.Left);
    const Expression = this.Rewrite(Node.Expression);
    return new DeclarationStatement(SyntaxKind.ReferenceStatement, Left, Node.Keyword, Expression);
  }

  private RewriteBinaryExpression(Node: BinaryExpression) {
    const Left = this.Rewrite(Node.Left);
    const Right = this.Rewrite(Node.Right);
    const Rewritten = new BinaryExpression(SyntaxKind.BinaryExpression, Left, Node.Operator, Right);
    const Flattened = this.FlattenBinaryExpression(Rewritten);
    return this.SimplifyBinaryTree(Flattened);
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
        return new BinaryExpression(SyntaxKind.BinaryExpression, this.Rewrite(Left), Right.Operator, this.Rewrite(Right.Right));
      }
    }
    return Node;
  }

  private SimplifyBinaryTree(Node: BinaryExpression) {
    if (Node.Right.Kind === SyntaxKind.UnaryExpression) {
      Node.Operator = this.SwitchSign(Node.Operator);
      Node.Right = this.Rewrite(this.SwitchSign(Node.Right));
    }
    return Node;
  }

  private RewriteUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return this.Rewrite(Node.Right);
      case SyntaxKind.MinusToken:
        return this.SwitchSign(this.Rewrite(Node.Right));
    }
    return Node;
  }

  private RewriteParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Rewrite(Node.Expression);
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
        throw this.Diagnostics.MissingSwitchMethod(Node.Kind);
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
        return new BinaryExpression(SyntaxKind.BinaryExpression, this.SwitchSign(Node.Left), Node.Operator, this.SwitchSign(Node.Right));
    }
    return Node;
  }
}
