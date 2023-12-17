import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { BinaryExpression } from "../Parser/BinaryExpression";
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
        return this.Rewrite((Node as NodeType<ParenthesizedExpression>).Expression);
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

  private RewriteBinaryExpression(Node: BinaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.MinusToken:
        const Left = this.Rewrite(Node.Left);
        const Operator = this.SwitchOperands(Node.Operator);
        const Right = this.Rewrite(this.SwitchOperands(Node.Right));
        return new BinaryExpression(SyntaxKind.BinaryExpression, Left, Operator, Right);
    }
    return Node;
  }

  private RewriteUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return this.Rewrite(Node.Right);
      case SyntaxKind.MinusToken:
        return this.SwitchOperands(this.Rewrite(Node.Right));
    }
    return Node;
  }

  SwitchOperands<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.BinaryExpression:
        return this.SwitchBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.UnaryExpression:
        return this.SwitchUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.SwitchParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.IdentifierToken:
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
        return this.SwitchSyntaxNode(Node as NodeType<SyntaxNode>);
      case SyntaxKind.PlusToken:
        return new SyntaxToken(SyntaxKind.MinusToken, "-");
      case SyntaxKind.MinusToken:
        return new SyntaxToken(SyntaxKind.PlusToken, "+");
      default:
        throw this.Diagnostics.MissingSwitchMethod(Node.Kind);
    }
  }

  private SwitchParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.SwitchOperands(Node.Expression);
  }

  private SwitchSyntaxNode(Node: SyntaxNode) {
    return new UnaryExpression(SyntaxKind.UnaryExpression, new SyntaxToken(SyntaxKind.MinusToken, "-"), Node);
  }

  private SwitchBinaryExpression(Node: BinaryExpression) {
    const Binary = new BinaryExpression(SyntaxKind.BinaryExpression, this.SwitchOperands(Node.Left), Node.Operator, this.SwitchOperands(Node.Right));
    return this.Rewrite(Binary);
  }

  private SwitchUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.MinusToken:
        return Node.Right;
      case SyntaxKind.PlusToken:
        return new UnaryExpression(SyntaxKind.UnaryExpression, this.SwitchOperands(Node.Operator), Node.Right);
    }
    return Node;
  }
}
