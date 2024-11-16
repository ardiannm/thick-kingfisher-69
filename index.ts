import { SourceText } from "./src/lexing/source.text";

var text = `"import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';"

"

"@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    Hello world!
  \`,
})
export class PlaygroundComponent {}

bootstrapApplication(PlaygroundComponent);



`;

console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();
console.log();

SourceText.createFrom(text)
  .getLineSpans()
  .forEach((span) => {
    span.getTokens().map((token) => console.log([span.line, span.start, span.end, token.kind, token.span.start, token.span.end, token.span.text.substring(0, 20)]));
    console.log();
  });
