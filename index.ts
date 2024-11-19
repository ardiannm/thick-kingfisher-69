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

const tokens = SourceText.createFrom(text).getLine(3).getTokens();
console.log(tokens);
