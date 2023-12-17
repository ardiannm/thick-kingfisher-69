import { DiagnosticBag } from "../Diagnostics/DiagnosticBag";
import { DiagnosticKind } from "../Diagnostics/DiagnosticKind";
import { BinaryExpression } from "../Parser/BinaryExpression";
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
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
      case SyntaxKind.RangeReference:
        return Node;
      case SyntaxKind.Program:
        return this.RewriteProgram(Node as NodeType<Program>);
      case SyntaxKind.UnaryExpression:
        return this.RewriteUnaryExpression(Node as NodeType<UnaryExpression>);
      default:
        throw this.Diagnostics.MissingMethod(Node.Kind);
    }
  }

  private RewriteProgram(Node: Program) {
    const Root = Node.Root.map((Statement) => this.Rewrite(Statement));
    return new Program(SyntaxKind.Program, Root);
  }

  private RewriteUnaryExpression(Node: UnaryExpression): SyntaxNode {
    const Right = Node.Right as UnaryExpression;
    if (Right.Kind === SyntaxKind.UnaryExpression && Right.Operator.Kind === Node.Operator.Kind) {
      return this.RewriteUnaryExpression(Right) as SyntaxNode;
    }
    return Node;
  }

  SwitchOperator<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
      case SyntaxKind.RangeReference:
        return Node;
      case SyntaxKind.BinaryExpression:
        return this.SwitchBinaryExpression(Node as NodeType<BinaryExpression>);
      default:
        throw this.Diagnostics.MissingSwitchMethod(Node.Kind);
    }
  }

  private SwitchBinaryExpression(Node: BinaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return new BinaryExpression(SyntaxKind.BinaryExpression, Node.Left, new SyntaxToken(SyntaxKind.MinusToken, "-"), Node.Right);
      case SyntaxKind.MinusToken:
        return new BinaryExpression(SyntaxKind.BinaryExpression, Node.Left, new SyntaxToken(SyntaxKind.PlusToken, "+"), Node.Right);
    }
    return Node;
  }
}
