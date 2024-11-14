import { lexer } from ".";

console.log(Array.from(lexer.lex()).map((token) => `${token.kind} -> (${token.span.text})`));
