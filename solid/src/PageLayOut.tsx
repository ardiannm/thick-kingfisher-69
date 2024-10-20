import ShowComponent from "./pages/ShowComponent";

import { Component } from "solid-js";
import MenuBarComponent from "./pages/MenuBarComponent";

const PageLayOut: Component = () => {
  return (
    <MenuBarComponent>
      <ShowComponent />
    </MenuBarComponent>
  );
};

export default PageLayOut;
