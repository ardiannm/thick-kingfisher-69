import { Routes } from "@angular/router";
import { EditorComponent } from "./editor/editor.component";
import { HomeComponent } from "./home/home.component";
import { EditorPageComponent } from "./page/editor-page/editor-page.component";

export const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
  },
  {
    path: "editor",
    component: EditorPageComponent,
  },
];
