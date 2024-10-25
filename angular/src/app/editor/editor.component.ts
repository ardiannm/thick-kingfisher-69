import { Component, Input, signal, computed, HostListener } from '@angular/core';
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
    } else if (input == 'Enter') {
      this.insertCharacter();
    } else if (input == 'Tab') {
      event.preventDefault();
      this.insertCharacter('\t');
    } else if (input == 'Backspace') {
      this.removeCharacter();
      console.log(this.caret());
    } else if (input == 'Delete') {
      this.moveCursorRight();
      this.removeCharacter();
    } else {
      if (input.length === 1 && !event.ctrlKey) this.insertCharacter(input);
    }
  }

  private moveCursorRight() {
    if (this.caret() < this.text.length - 1) this.caret.update((v) => v + 1);
  }

  private moveCursorLeft() {
    if (this.caret() > 0) this.caret.update((v) => v - 1);
  }

  private insertCharacter(charText: string = '\n') {
    const text = this.code();
    const newText = text.slice(0, this.caret()) + charText + text.slice(this.caret());
    this.code.set(newText);
    this.moveCursorRight();
  }

  private removeCharacter() {
    if (this.caret() > 0) {
      const text = this.code();
      const newText = text.slice(0, this.caret() - 1) + text.slice(this.caret());
      this.code.set(newText);
      this.moveCursorLeft();
    }
  }
}
