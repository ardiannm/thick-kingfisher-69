import { Highlighter } from "./highlighter.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);
  const scopes = tree.generate();

  console.log(scopes);

  console.log("\n\n");
}
