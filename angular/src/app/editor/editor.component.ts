import { Component, Input, signal, computed, HostListener, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CursorComponent } from './cursor/cursor.component';
import { DOCUMENT, NgClass, isPlatformBrowser } from '@angular/common';

import * as MyCustomParser from '../../../../ng';

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

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CursorComponent, NgClass],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  @Input()
  text = text;
  length = text.length;
  code = signal(text);
  sourceText = computed(() => MyCustomParser.SourceText.createFrom(this.code()));
  lines = computed(() => this.sourceText().getLineSpans());
  cursor = signal(this.text.length);
  line = computed(() => this.sourceText().getLineNumber(this.cursor()));
  column = computed(() => this.sourceText().getColumnNumber(this.cursor()));
  cursorX = 0;
  cursorY = 0;
  caretWidth = 4;
  prevColumn = this.line();

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    effect(
      () => {
        const current = this.code().length;
        const change = current - this.length;
        this.cursor.update((pos) => pos + change);
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
        setTimeout(() => this.getCursorPosition(line, column));
      });
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    const line = this.line();
    const column = this.column();
    this.getCursorPosition(line, column);
  }

  private getCursorPosition(line: number, column: number) {
    const element = this.document.getElementById('row-' + line)!;
    if (element && element.childNodes.length > 0) {
      const textNode = element.childNodes[0];
      if (textNode.nodeType === Node.TEXT_NODE) {
        const range = this.document.createRange();
        range.setStart(textNode, column);
        range.setEnd(textNode, column + 1);
        const rect = range.getBoundingClientRect();
        this.cursorX = rect.x;
        this.cursorY = rect.y;
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
      this.transformCaretY(-1);
    } else if (input === 'ArrowDown') {
      event.preventDefault();
      this.transformCaretY(+1);
    } else if (input === 'Enter') {
      this.insertText();
    } else if (input === 'Tab') {
      event.preventDefault();
      this.insertText('\t');
    } else if (input === 'Backspace') {
      this.removeText();
    } else if (input === 'Delete' && this.cursor() !== this.length) {
      this.tranformCaretX(+1);
      this.removeText();
    } else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.insertText(input);
    }
  }

  private insertText(charText: string = '\n') {
    const text = this.code();
    const pos = this.cursor();
    const newText = text.substring(0, pos) + charText + text.substring(pos);
    this.code.set(newText);
  }

  private removeText() {
    const text = this.code();
    const pos = this.cursor();
    const newText = text.substring(0, pos - 1) + text.substring(pos);
    this.code.set(newText);
  }

  private tranformCaretX(steps: number) {
    const pos = this.cursor();
    const newPos = pos + steps;
    if (newPos >= 0 && newPos <= this.length) {
      this.cursor.set(newPos);
      this.prevColumn = this.column();
    }
  }

  transformCaretY(steps: number) {
    const prevLine = this.line() + steps;
    if (prevLine > 0) {
      const pos = this.sourceText().getCursorPosition(prevLine, this.prevColumn);
      this.cursor.set(pos);
    } else {
      this.prevColumn = 1;
      this.cursor.set(0);
    }
  }
}
