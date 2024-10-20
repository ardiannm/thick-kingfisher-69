/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";

import { Router, Route } from "@solidjs/router";
import ShowComponent from "./pages/ShowComponent";
import MenuBarComponent from "./pages/MenuBarComponent";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

render(
  () => (
    <Router>
      <Route path="/" component={MenuBarComponent} />
      <Route path="/editor-component-view" component={ShowComponent} />
    </Router>
  ),

  root!
);
