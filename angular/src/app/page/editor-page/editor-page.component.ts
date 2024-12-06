import { Component } from "@angular/core";
import { DiagnosticWithPosition, EditorComponent, Position } from "../../editor/editor.component";
import { DiagnosticComponent } from "../../editor/diagnostic/diagnostic.component";

@Component({
  selector: "app-editor-page",
  standalone: true,
  imports: [EditorComponent, DiagnosticComponent],
  templateUrl: "./editor-page.component.html",
  styleUrl: "./editor-page.component.scss",
})
export class EditorPageComponent {
  diagnostics = new Array<DiagnosticWithPosition>();

  renderDiagnostics(diagnostics: DiagnosticWithPosition[]) {
    this.diagnostics = diagnostics;
    console.log(diagnostics[0]);
  }
}
