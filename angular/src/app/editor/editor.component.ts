import { Component, Input, signal, computed, HostListener, effect, Inject, PLATFORM_ID } from '@angular/core';
import { SourceText } from './source.text';
import { CaretComponent } from './caret/caret.component';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

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

bootstrapApplication(PlaygroundComponent);



`;

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
  length = text.length;
  code = signal(text);
  sourceText = computed(() => SourceText.createFrom(this.code()));
  lines = computed(() => this.sourceText().getLines());
  caret = signal(this.text.length);
  line = computed(() => this.sourceText().getLine(this.caret()));
  column = computed(() => this.sourceText().getColumn(this.caret()));
  caretX = 0;
  caretY = 0;
  caretWidth = 4;
  prevColumn = this.line();

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    effect(
      () => {
        const current = this.code().length;
        const change = current - this.length;
        this.caret.update((pos) => pos + change);
        this.length = current;
      },
      {
        allowSignalWrites: true,
      }
    );
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const line = this.line();
        const column = this.column();
        setTimeout(() => this.getCaretPosition(line, column));
      });
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    const line = this.line();
    const column = this.column();
    this.getCaretPosition(line, column);
  }

  private getCaretPosition(line: number, column: number) {
    const element = this.document.getElementById('row-' + line)!;

    if (element && element.childNodes.length > 0) {
      const textNode = element.childNodes[0];

      if (textNode.nodeType === Node.TEXT_NODE) {
        const range = this.document.createRange();

        range.setStart(textNode, column);
        range.setEnd(textNode, column + 1);

        const rect = range.getBoundingClientRect();

        this.caretX = rect.x;
        this.caretY = rect.y;

        // Clean up the range to avoid memory leaks
        range.detach();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (input === 'ArrowRight') {
      event.preventDefault();
      this.tranformCaretX(+1);
    } else if (input === 'ArrowLeft') {
      event.preventDefault();
      this.tranformCaretX(-1);
    } else if (input === 'ArrowUp') {
      event.preventDefault();
      this.transformCaretY(+1);
    } else if (input === 'ArrowDown') {
      event.preventDefault();
      this.transformCaretY(-1);
    } else if (input === 'Enter') {
      this.insertText();
    } else if (input === 'Tab') {
      event.preventDefault();
      this.insertText('\t');
    } else if (input === 'Backspace') {
      this.removeText();
    } else if (input === 'Delete' && this.caret() !== this.length) {
      this.tranformCaretX(+1);
      this.removeText();
    } else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
      this.insertText(input);
    }
  }

  private insertText(charText: string = '\n') {
    const text = this.code();
    const pos = this.caret();
    const newText = text.substring(0, pos) + charText + text.substring(pos);
    this.code.set(newText);
  }

  private removeText() {
    const text = this.code();
    const pos = this.caret();
    const newText = text.substring(0, pos - 1) + text.substring(pos);
    this.code.set(newText);
  }

  private tranformCaretX(steps: number) {
    const pos = this.caret();
    const newPos = pos + steps;
    if (newPos >= 0 && newPos <= this.length) {
      this.caret.set(newPos);
      this.prevColumn = this.column();
    }
  }

  transformCaretY(steps: number) {
    const prevLine = this.line() - steps;
    const pos = this.sourceText().getPosition(prevLine, this.prevColumn);
    this.caret.set(pos);
  }
}
