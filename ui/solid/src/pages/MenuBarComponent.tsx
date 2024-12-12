import { A } from "@solidjs/router";
import scss from "./MenuBarComponent.module.scss";

import { Component, JSXElement } from "solid-js";

type MenuBarComponentProps = {
  children?: JSXElement;
};

const MenuBarComponent: Component<MenuBarComponentProps> = (props: MenuBarComponentProps) => {
  return (
    <div class={scss.main}>
      <div class={scss.MenuBarComponent}>
        <A href="/">
          <div class={scss.MenuBarOption}>Option 1</div>
        </A>
        <A href="/editor-component-view">
          <div class={scss.MenuBarOption}>Option 2</div>
        </A>
      </div>
      {props.children}
    </div>
  );
};

export default MenuBarComponent;
