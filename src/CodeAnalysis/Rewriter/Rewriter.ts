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
      case SyntaxKind.NumberToken:
      case SyntaxKind.CellReference:
      case SyntaxKind.RangeReference:
        return Node;
      case SyntaxKind.Program:
        return this.RewriteProgram(Node as NodeType<Program>);
      case SyntaxKind.UnaryExpression:
        return this.RewriteUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.BinaryExpression:
        return this.RewriteBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.RewriteParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      default:
        throw this.Diagnostics.MissingMethod(Node.Kind);
    }
  }

  private RewriteProgram(Node: Program) {
    const Root = Node.Root.map((Statement) => this.Rewrite(Statement));
    return new Program(SyntaxKind.Program, Root);
  }

  private RewriteUnaryExpression(Node: UnaryExpression) {
    // return this.SwitchOperator(Node);

    switch (Node.Operator.Kind) {
      // just return in case plus token
      case SyntaxKind.PlusToken:
        return this.Rewrite(Node.Right);

      case SyntaxKind.MinusToken:
        switch (Node.Right.Kind) {
          case SyntaxKind.UnaryExpression:
          case SyntaxKind.ParenthesizedExpression:
            return this.Rewrite(this.SwitchOperator(Node.Right));
        }
    }
    return new UnaryExpression(SyntaxKind.UnaryExpression, Node.Operator, this.Rewrite(Node.Right));
  }

  private RewriteBinaryExpression(Node: BinaryExpression) {
    return new BinaryExpression(SyntaxKind.BinaryExpression, this.Rewrite(Node.Left), Node.Operator, this.Rewrite(Node.Right));
  }

  private RewriteParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.Rewrite(Node.Expression);
  }

  SwitchOperator<Kind extends SyntaxNode>(Node: Kind): SyntaxNode {
    type NodeType<T> = Kind & T;
    switch (Node.Kind) {
      case SyntaxKind.CellReference:
      case SyntaxKind.RangeReference:
        return Node;
      case SyntaxKind.BinaryExpression:
        return this.SwitchBinaryExpression(Node as NodeType<BinaryExpression>);
      case SyntaxKind.ParenthesizedExpression:
        return this.SwitchParenthesizedExpression(Node as NodeType<ParenthesizedExpression>);
      case SyntaxKind.UnaryExpression:
        return this.SwitchUnaryExpression(Node as NodeType<UnaryExpression>);
      case SyntaxKind.NumberToken:
        return this.SwitchNumberToken(Node as NodeType<SyntaxToken>);
      default:
        throw this.Diagnostics.MissingSwitchMethod(Node.Kind);
    }
  }

  private SwitchBinaryExpression(Node: BinaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return new BinaryExpression(SyntaxKind.BinaryExpression, this.SwitchOperator(Node.Left), new SyntaxToken(SyntaxKind.MinusToken, "-"), Node.Right);
      case SyntaxKind.MinusToken:
        return new BinaryExpression(SyntaxKind.BinaryExpression, this.SwitchOperator(Node.Left), new SyntaxToken(SyntaxKind.PlusToken, "+"), Node.Right);
    }
    return Node;
  }

  private SwitchParenthesizedExpression(Node: ParenthesizedExpression) {
    return this.SwitchOperator(Node.Expression);
  }

  private SwitchUnaryExpression(Node: UnaryExpression) {
    switch (Node.Operator.Kind) {
      case SyntaxKind.PlusToken:
        return new UnaryExpression(SyntaxKind.UnaryExpression, new SyntaxToken(SyntaxKind.MinusToken, "-"), Node.Right);
      case SyntaxKind.MinusToken:
        return new UnaryExpression(SyntaxKind.UnaryExpression, new SyntaxToken(SyntaxKind.PlusToken, "+"), Node.Right);
    }
    return Node;
  }

  private SwitchNumberToken(Node: SyntaxToken) {
    return new UnaryExpression(SyntaxKind.UnaryExpression, new SyntaxToken(SyntaxKind.MinusToken, "-"), Node);
  }
}
