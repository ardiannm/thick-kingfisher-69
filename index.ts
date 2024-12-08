import { SourceText } from "./src/lexing/source.text";

// var text = `A1 :: A3
//   A2 :: A1
//    A3 :: A2
// A4 :: A3
//   A1 :: A4
// `;

// this test case is problematic
const code = `A1 :: 4
A5 :: 2    
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+       A5
A3 :: 1


`;

const tree = SourceText.parse(code);
tree.getLines().forEach((line) => console.log([Array.from(line.getTokens()).map((token) => token.span.text), line.span.text]));
