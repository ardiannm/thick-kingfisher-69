import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-caret',
  standalone: true,
  imports: [],
  templateUrl: './caret.component.html',
  styleUrl: './caret.component.scss',
})
export class CaretComponent {
  @HostBinding('style.left.px') @Input() column = 0;
  @HostBinding('style.top.px') @Input() line = 0;
  @HostBinding('style.width.px') @Input() width = 4;
  @HostBinding('style.height.px') @Input() height = 19;
}
