import { Highlighter } from "./highlighter.ts";
import { loggerLog } from "./log.ts";
import { Parser } from "./parser.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);

  loggerLog(tree.spans);

  console.log(new Parser(input).parseAddition());
}
