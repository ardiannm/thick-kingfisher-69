import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-caret',
  standalone: true,
  imports: [],
  templateUrl: './caret.component.html',
  styleUrl: './caret.component.scss',
})
export class CaretComponent {
  @HostBinding('style.left.px') @Input() line = 200;
  @HostBinding('style.top.px') @Input() column = 100;
}
