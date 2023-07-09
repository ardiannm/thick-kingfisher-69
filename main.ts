import { Highlighter } from "./highlighter.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);

  tree.generate();
}
