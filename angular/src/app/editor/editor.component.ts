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

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    const input = event.key as string;
    if (input === 'ArrowRight') {
    } else if (input == 'ArrowLeft') {
    } else if (input == 'Enter') {
    } else if (input == 'Tab') {
    } else if (input == 'Backspace') {
    } else if (input == 'Delete') {
    } else {
      if (input.length === 1 && !event.ctrlKey) this.insertCharacter(input);
    }
  }

  private insertCharacter(charText: string = '\n') {
    const text = this.code();
    const newText = text.substring(0, this.caret()) + charText + text.substring(this.caret());
    this.code.set(newText);
  }
}
