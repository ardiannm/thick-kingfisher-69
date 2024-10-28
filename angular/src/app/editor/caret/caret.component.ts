import { Component, HostBinding, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-caret',
  standalone: true,
  imports: [],
  templateUrl: './caret.component.html',
  styleUrls: ['./caret.component.scss'],
})
export class CaretComponent implements OnChanges {
  @HostBinding('style.left.px') @Input() x = 0;
  @HostBinding('style.top.px') @Input() y = 0;
  @HostBinding('style.width.px') @Input() width = 8;
  @HostBinding('style.height.px') @Input() height = 19;

  @HostBinding('class.stop') disableBlink = false;

  ngOnChanges(): void {
    this.disableBlink = true;
    if (this.disableBlink) {
      setTimeout(() => (this.disableBlink = false), 250);
    }
  }
}
