import { SourceText } from "./src/lexing/source.text";

var text = `import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  template: "
    Hello world!
  ",
})
export class PlaygroundComponent {}

bootstrapApplication(PlaygroundComponent);



`;

console.log();
console.log();
console.log();

SourceText.createFrom(text).getLine(7).getTokens();
