import { Component, Input, signal, computed, HostListener, effect, Inject, PLATFORM_ID } from "@angular/core";
import { CursorComponent } from "./cursor/cursor.component";
import { DOCUMENT, NgClass, isPlatformBrowser } from "@angular/common";

import { SourceText } from "../../../../ng";

var text = `A1 :: A4
A5 :: A2
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+A5
A3 :: 1
`;

@Component({
  selector: "app-editor",
  standalone: true,
  imports: [CursorComponent, NgClass],
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.scss",
})
export class EditorComponent {
  @Input()
  text = text;
  length = text.length;
  code = signal(text);
  source = computed(() => SourceText.parse(this.code()));
  lines = computed(() => this.source().getLines());
  cursor = signal(this.text.length);
  line = computed(() => this.source().getLine(this.cursor()));
  column = computed(() => this.source().getColumn(this.cursor()));
  cursorX = 0;
  cursorY = 0;
  caretWidth = 4;
  prevColumn = this.line();
  diagnostics = computed(() => this.source().diagnostics.getDiagnostics());

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const line = this.line();
        const column = this.column();
        setTimeout(() => this.renderPosition(line, column));
      });
    }
  }

  @HostListener("window:scroll")
  @HostListener("window:resize")
  onWindowChange() {
    const line = this.line();
    const column = this.column();
    this.renderPosition(line, column);
  }

  private renderPosition(line: number, column: number) {
    const pos = this.getPosition(line, column);
    this.cursorX = pos.cursorX;
    this.cursorY = pos.cursorY;
  }

  @HostListener("window:keydown", ["$event"])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (event.ctrlKey && input === "x") {
      this.removeLine();
    } else if (input === "ArrowRight") {
      event.preventDefault();
      this.tranformCaretX(+1);
    } else if (input === "ArrowLeft") {
      event.preventDefault();
      this.tranformCaretX(-1);
    } else if (input === "ArrowUp") {
      event.preventDefault();
      this.transformCaretY(-1);
    } else if (input === "ArrowDown") {
      event.preventDefault();
      this.transformCaretY(+1);
    } else if (input === "Enter") {
      this.insertText();
    } else if (input === "Tab") {
      event.preventDefault();
      this.insertText("\t");
    } else if (input === "Backspace") {
      this.removeText();
    } else if (input === "Delete" && this.cursor() !== this.length) {
      this.tranformCaretX(+1);
      this.removeText();
    } else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.insertText(input);
    }
  }

  removeLine() {}

  private insertText(charText: string = "\n") {
    const text = this.code();
    const pos = this.cursor();
    const newText = text.substring(0, pos) + charText + text.substring(pos);
    this.code.set(newText);
    this.cursor.update((pos) => pos + 1);
  }

  private removeText() {
    const text = this.code();
    const pos = this.cursor();
    const newText = text.substring(0, pos - 1) + text.substring(pos);
    this.code.set(newText);
    this.cursor.update((pos) => (pos > 0 ? pos - 1 : 0));
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
      const pos = this.source().getPosition(prevLine, this.prevColumn);
      this.cursor.set(pos);
    } else {
      this.prevColumn = 1;
      this.cursor.set(0);
    }
  }

  private getPosition(line: number, column: number): { cursorX: number; cursorY: number } {
    const lineElement = this.document.getElementById(`row-${line}`)!; // Non-null assertion.
    let charCount = 0;
    column--;
    for (const child of Array.from(lineElement.childNodes)) {
      const range = this.document.createRange();
      try {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const span = child as HTMLElement;
          const spanText = span.textContent || "";
          const spanLength = spanText.length;
          if (charCount + spanLength >= column) {
            const offsetInSpan = column - charCount;
            range.setStart(span.firstChild!, offsetInSpan);
            range.setEnd(span.firstChild!, offsetInSpan);
            return this.getCursorPositionFromRange(range);
          }
          charCount += spanLength;
        } else if (child.nodeType === Node.TEXT_NODE) {
          const textNode = child as Text;
          const textLength = textNode.textContent?.length || 0;
          if (charCount + textLength >= column) {
            const offsetInText = column - charCount;
            range.setStart(textNode, offsetInText);
            range.setEnd(textNode, offsetInText);
            return this.getCursorPositionFromRange(range);
          }
          charCount += textLength;
        }
      } finally {
        range.detach();
      }
    }
    const lastElement = lineElement.lastElementChild as HTMLElement;
    const rect = lastElement.getBoundingClientRect();
    return { cursorX: rect.right, cursorY: rect.top };
  }

  private getCursorPositionFromRange(range: Range): { cursorX: number; cursorY: number } {
    const rect = range.getBoundingClientRect();
    return { cursorX: rect.x, cursorY: rect.y };
  }
}
