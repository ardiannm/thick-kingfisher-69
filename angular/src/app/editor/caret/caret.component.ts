import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-caret',
  standalone: true,
  imports: [],
  templateUrl: './caret.component.html',
  styleUrl: './caret.component.scss',
})
export class CaretComponent {
  @HostBinding('line.px') @Input() line = 0;
  @HostBinding('column.px') @Input() column = 0;
}
