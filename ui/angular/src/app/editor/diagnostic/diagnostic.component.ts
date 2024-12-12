import { Component, HostBinding, Input, OnInit } from "@angular/core";
import { Position } from "../editor.component";

@Component({
  selector: "app-diagnostic",
  standalone: true,
  imports: [],
  templateUrl: "./diagnostic.component.html",
  styleUrl: "./diagnostic.component.scss",
})
export class DiagnosticComponent implements OnInit {
  @Input() from: Position = { x: 0, y: 0, height: 0 };
  @Input() to: Position = { x: 0, y: 0, height: 0 };
  @HostBinding("style.left.px") x = this.from.x;
  @HostBinding("style.top.px") y = this.from.y;
  @HostBinding("style.width.px") width = 8;
  @HostBinding("style.height.px") @Input() height = 14;

  ngOnInit(): void {
    this.x = this.from.x;
    this.y = this.from.y;
    this.width = this.to.x - this.from.x;
    console.log(this.width);

    this.height = this.from.height - 2;
  }
}
