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
  pos = signal(0);
  line = computed(() => this.sourceText().getLineIndex(this.pos()) + 1);

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
    if (this.pos() < this.text.length) this.pos.update((v) => v + 1);
  }

  private moveCursorLeft() {
    if (this.pos() > 0) this.pos.update((v) => v - 1);
  }
}
