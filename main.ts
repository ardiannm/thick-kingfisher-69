import { Highlighter } from "./highlighter.ts";
import { loggerLog } from "./log.ts";

while (true) {
  const input = prompt("//") || "";
  const tree = new Highlighter(input);
  
  loggerLog(tree.spans);
}
