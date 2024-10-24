import { Component, Input, signal, computed } from '@angular/core';

const txt = `import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

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

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  @Input('codeInput') sourceText = txt;

  code = signal(txt);

  rows = computed(() => this.code().split('\n'));
}
