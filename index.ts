import { SyntaxTree } from "./src/syntax.tree";

// var text = `A1 :: A3
//   A2 :: A1
//    A3 :: A2
// A4 :: A3
//   A1 :: A4
// `;

// this test case is problematic
var text = `A1 :: A4
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A1
A3 :: 1
`;

SyntaxTree.createFrom(text);
