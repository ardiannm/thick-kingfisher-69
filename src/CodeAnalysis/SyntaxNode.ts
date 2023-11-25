import { SyntaxKind } from "./SyntaxKind";
import { SyntaxToken } from "./SyntaxToken";

class SyntaxChildNode {
  constructor(public Node: SyntaxNode, public isLast: boolean) {}
}

export class SyntaxNode {
  constructor(public Kind: SyntaxKind) {}

  public *GetChildren() {
    const Children = Object.keys(this)
      .map((key) => this[key])
      .filter((value) => value instanceof SyntaxNode);

    for (let i = 0; i < Children.length; i++) {
      yield new SyntaxChildNode(Children[i], i + 1 === Children.length);
    }
  }
}

export class SyntaxTree extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Root: SyntaxNode, public Diagnostics: Array<string>) {
    super(Kind);
  }
  public Print(Node: SyntaxNode = this, Indentation = "") {
    var Text = "";
    for (const Child of Node.GetChildren()) {
      if (Child.isLast) {
        Text += Indentation + "└── " + Child.Node.Kind + "\n" + this.Print(Child.Node, Indentation + "    ");
      } else {
        Text += Indentation + "├── " + Child.Node.Kind + "\n" + this.Print(Child.Node, Indentation + "│   ");
      }
    }
    return Text;
  }
}

export class BadSyntax extends SyntaxNode {
  constructor(public Kind: SyntaxKind, public Token: SyntaxToken) {
    super(Kind);
  }
}

export class Expression extends SyntaxNode {}

export class CellReference extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxToken, public Right: SyntaxToken) {
    super(Kind);
  }
}

export class RangeReference extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ParenthesizedExpression extends Expression {
  constructor(public Kind: SyntaxKind, public OpenParen: SyntaxNode, public Expression: SyntaxNode, public CloseParen: SyntaxNode) {
    super(Kind);
  }
}

export class UnaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class BinaryExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Left: SyntaxNode, public Operator: SyntaxNode, public Right: SyntaxNode) {
    super(Kind);
  }
}

export class ReferenceExpression extends Expression {
  constructor(public Kind: SyntaxKind, public Reference: SyntaxNode, public Expression: SyntaxNode) {
    super(Kind);
  }
}
