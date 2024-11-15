import { SourceText } from "./src/lexing/source.text";

var text = `import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
"
this is a multiline comment
"
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

const src = SourceText.createFrom(text);

console.log(src.getTokens().map((token) => [token.kind, token.span.start, token.span.end, token.span.text]));
