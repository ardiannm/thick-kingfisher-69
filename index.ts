import { Lexer } from "./src/lexing/lexer";

var text = `import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
'''
this is a multiline comment
'''
@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    Hello world!
  \`,
})
export class PlaygroundComponent {}
bootstrapApplication(PlaygroundComponent);
`;

text = `1 23345 parser.ts " `;

const lexer = Lexer.createFrom(text);

const tokens = Array.from(lexer.lex());

console.log(tokens.map((token) => `${token.kind} -> (${token.span.text}) -> (${token.span.start}, ${token.span.end})`));
