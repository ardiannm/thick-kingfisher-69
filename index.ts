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

text = `" name another one more value"`;

const lexer = Lexer.createFrom(SourceText.createFrom(text));

for (const token of lexer.lex()) {
  console.log(`(${token.span.text})\t\t` + token.kind);
}
