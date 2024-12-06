import { Component, Input, signal, computed, HostListener, effect, Inject, PLATFORM_ID, Output, EventEmitter, AfterViewInit } from "@angular/core";
import { CursorComponent } from "./cursor/cursor.component";
import { DOCUMENT, NgClass, isPlatformBrowser } from "@angular/common";

import { SourceText } from "../../../../ng";

// var text = `A1 :: A3
//   A2 :: A1
//    A3 :: A2
// A4 :: A3
//   A1 :: A4
// `;

// this test case is problematic
var text = `A1 :: A4
A5 :: A2
A2 :: A1+3
A3 :: A2+5
A4 :: A3+A2+A5
A3 :: 1
`;

export interface Position {
  x: number;
  y: number;
  height: number;
}

export interface DiagnosticWithPosition {
  from: Position;
  to: Position;
}

@Component({
  selector: "app-editor",
  standalone: true,
  imports: [CursorComponent, NgClass],
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.scss",
})
export class EditorComponent implements AfterViewInit {
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
  diagnostics = computed(() => this.source().diagnosticsBag.diagnostics);
  @Output("diagnostics") emitDiagnosticsPositions = new EventEmitter<DiagnosticWithPosition[]>();

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    effect(
      () => {
        const current = this.code().length;
        const change = current - this.length;
        this.cursor.update((pos) => (pos + change >= 0 ? pos + change : 0));
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
        setTimeout(() => this.renderPosition(line, column));
        this.emitDiagnosticPositions();
      });
    }
  }

  @HostListener("window:scroll")
  @HostListener("window:resize")
  onWindowChange() {
    this.renderPosition(this.line(), this.column());
    this.emitDiagnosticPositions();
  }

  private renderPosition(line: number, column: number) {
    const pos = this.getPosition(line, column);
    this.cursorX = pos.x;
    this.cursorY = pos.y;
  }

  emitDiagnosticPositions() {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const positions = this.diagnostics().map((d) => ({ from: this.getPosition(d.span.line, d.span.column), to: this.getPosition(d.span.line, d.span.column + d.span.length) }));
        this.emitDiagnosticsPositions.emit(positions);
      }
    });
  }

  ngAfterViewInit() {
    this.emitDiagnosticPositions();
  }

  @HostListener("window:keydown", ["$event"])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (event.ctrlKey && input === "x") {
      this.removeLine();
    } else if (input === "ArrowRight") {
      event.preventDefault();
      this.tranformCaretX();
    } else if (input === "ArrowLeft") {
      event.preventDefault();
      this.tranformCaretX(-1);
    } else if (input === "ArrowUp") {
      event.preventDefault();
      this.transformCaretY(-1);
    } else if (input === "ArrowDown") {
      event.preventDefault();
      this.transformCaretY();
    } else if (input === "Enter") {
      this.insertText();
    } else if (input === "Tab") {
      event.preventDefault();
      this.insertText("\t");
    } else if (input === "Backspace") {
      this.removeText();
    } else if (input === "Delete" && this.cursor() !== this.length) {
      this.deleteText();
    } else if (input.length === 1 && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.insertText(input);
    }
  }

  private deleteText() {
    this.tranformCaretX();
    this.removeText();
  }

  private removeLine() {
    const ln = this.line() - 1;
    if (ln >= 0) {
      const line = this.lines()[ln];
      const text = this.code().slice(0, line.span.start) + this.code().slice(line.span.end);
      this.code.set(text);
      setTimeout(() => {
        this.cursor.set(line.span.start);
        this.deleteText();
      });
    }
  }

  private insertText(charText: string = "\n") {
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

  private tranformCaretX(steps: number = 1) {
    const pos = this.cursor();
    const newPos = pos + steps;
    if (newPos >= 0 && newPos <= this.length) {
      this.cursor.set(newPos);
      this.prevColumn = this.column();
    }
  }

  transformCaretY(steps: number = 1) {
    const prevLine = this.line() + steps;
    if (prevLine > 0) {
      const pos = this.source().getPosition(prevLine, this.prevColumn);
      this.cursor.set(pos);
    } else {
      this.prevColumn = 1;
      this.cursor.set(0);
    }
  }

  protected getPosition(line: number, column: number): Position {
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
    return { x: rect.right, y: rect.top, height: rect.height };
  }

  private getCursorPositionFromRange(range: Range): Position {
    const rect = range.getBoundingClientRect();
    return { x: rect.x, y: rect.y, height: rect.height };
  }

  protected isActive(ln: number): any {
    return ln + 1 === this.line();
  }
}
