import { Component, Input, signal, computed, effect, HostListener } from '@angular/core';
import { SourceText } from './source.tex';

const text = `import {Component} from '@angular/core';
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
  @Input('codeInput') text = text;
  code = signal(text);
  sourceText = computed(() => SourceText.createFrom(this.code()));
  lines = computed(() => this.sourceText().getLines());
  caret = signal(0);
  pos = computed(() => this.caret() + 1);
  line = computed(() => this.sourceText().getLineIndex(this.caret()) + 1);
  column = computed(() => this.sourceText().getColumnIndex(this.caret()) + 1);

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (input === 'ArrowRight') {
      this.moveCursorRight();
    } else if (input == 'ArrowLeft') {
      this.moveCursorLeft();
    }
  }

  constructor() {}

  private moveCursorRight() {
    if (this.caret() < this.text.length) this.caret.update((v) => v + 1);
  }

  private moveCursorLeft() {
    if (this.caret() > 0) this.caret.update((v) => v - 1);
  }
}
