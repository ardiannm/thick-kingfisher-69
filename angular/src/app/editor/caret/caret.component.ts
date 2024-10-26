import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-caret',
  standalone: true,
  imports: [],
  templateUrl: './caret.component.html',
  styleUrl: './caret.component.scss',
})
export class CaretComponent {
  @HostBinding('left.px') @Input() left = 0;
  @HostBinding('right.px') @Input() right = 0;
}
