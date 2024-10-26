import { Component, Input, signal, computed, HostListener, effect } from '@angular/core';
import { SourceText } from './source.text';
import { CaretComponent } from './caret/caret.component';

var text = `import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    Hello world!
  \`,
})
export class PlaygroundComponent {}

bootstrapApplication(PlaygroundComponent);`;

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CaretComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  @Input('codeInput')
  text = text;
  textLength = this.text.length;
  code = signal(text);
  sourceText = computed(() => SourceText.createFrom(this.code()));
  lines = computed(() => this.sourceText().getLines());
  caret = signal(this.text.length);
  line = computed(() => this.sourceText().getLine(this.caret()));
  column = computed(() => this.sourceText().getColumn(this.caret()));
  caretX = 500;
  caretY = 200;

  constructor() {
    effect(
      () => {
        const current = this.code().length;
        const change = current - this.textLength;
        this.caret.update((pos) => pos + change);
        this.textLength = current;
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (input === 'ArrowRight') {
      this.moveCaret(1);
    } else if (input == 'ArrowLeft') {
      this.moveCaret(-1);
    } else if (input == 'Enter') {
      this.insertCharacter();
    } else if (input == 'Tab') {
      event.preventDefault();
      this.insertCharacter('\t');
    } else if (input == 'Backspace') {
      this.removeCharacter();
    } else if (input == 'Delete') {
    } else {
      if (input.length === 1 && !event.ctrlKey && !event.altKey) this.insertCharacter(input);
    }
  }

  private insertCharacter(charText: string = '\n') {
    const text = this.code();
    const newText = text.substring(0, this.caret()) + charText + text.substring(this.caret());
    this.code.set(newText);
  }

  private removeCharacter() {
    const text = this.code();
    const newText = text.substring(0, this.caret() - 1) + text.substring(this.caret());
    this.code.set(newText);
  }

  private moveCaret(steps: number) {
    const pos = this.caret();
    const newPos = pos + steps;
    if (newPos >= 0 && newPos <= this.textLength) this.caret.set(newPos);
  }
}
