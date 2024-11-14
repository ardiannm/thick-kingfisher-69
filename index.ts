import { Lexer } from "./src/lexing/lexer";
import { SourceText } from "./src/lexing/source.text";

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

text = `1 23345 an `;

const lexer = Lexer.createFrom(SourceText.createFrom(text));

// console.log([...lexer.lex()].map((token) => token.span.text));
console.log([...lexer.lex()].map((token) => `${token.kind} -> ${token.span.start}, ${token.span.end} -> (${token.span.text})`));
