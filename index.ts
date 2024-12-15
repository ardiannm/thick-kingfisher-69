import { SyntaxCellAssignment } from "./src/analysis/parsing/syntax.cell.assignment";
import { SyntaxTree } from "./src/syntax.tree";

const text = `A1 :: 4+
A5 :: 2    
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+       A5
A3 :: 1


`;

const tree = SyntaxTree.createFrom(text);

const root = tree.root.statements.map((node) => {
  const n = node as SyntaxCellAssignment;
  return [n.kind, n.left.text, n.span.text];
});

console.log(root);

/**
 
[
  [ 'SyntaxCellAssignment', 'A1', 'A1 :: 4+\nA5' ],
  [ 'SyntaxCellAssignment', '::', ':: 2' ],
  [ 'SyntaxCellAssignment', 'A2', 'A2 :: A1+3' ],
  [ 'SyntaxCellAssignment', 'A3', 'A3 :: A2+5' ],
  [ 'SyntaxCellAssignment', 'A4', 'A4 :: A3+A2+       A5' ],
  [ 'SyntaxCellAssignment', 'A3', 'A3 :: 1' ]
]
 */

const tokens = tree.source.getLines().map((ln) => Array.from(ln.getTokens()).map((token) => token.span.text));

console.log(tokens);
