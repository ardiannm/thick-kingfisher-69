import { Routes } from "@angular/router";
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
